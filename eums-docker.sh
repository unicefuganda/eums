#!/bin/sh
#EUMS Management script
# set -e

EUMS_MONGO_DATA="eums_mongo_data"
EUMS_MONGO="eums_mongo"
EUMS_CONTACTS="eums_contacts"
EUMS_POSTGRES_DATA="eums_postgres_data"
EUMS_POSTGRES="eums_postgres"
EUMS_WEB="eums_web"
EUMS_REDIS="eums_redis"
EUMS_CELERY_WORKER="eums_celery_worker"
EUMS_NGINX="eums_nginx"
CONTAINER_NAMES="${EUMS_NGINX} ${EUMS_WEB} ${EUMS_CELERY_WORKER} ${EUMS_POSTGRES} ${EUMS_REDIS} ${EUMS_CONTACTS} ${EUMS_MONGO}"

function start_contacts {
  docker create --name ${EUMS_MONGO_DATA} --entrypoint="/bin/true" -v /data/mongo mongo
  docker run -d --name ${EUMS_MONGO} --volumes-from ${EUMS_MONGO_DATA} mongo
  docker run -d --name ${EUMS_CONTACTS} --link ${EUMS_MONGO}:mongo cuevee/contacts
}

function start_postgres {
  docker create --name ${EUMS_POSTGRES_DATA} --entrypoint="/bin/true" -v /data/postgres postgres
  docker run -d --name ${EUMS_POSTGRES} -e "PGDATA=/data/postgres" --volumes-from ${EUMS_POSTGRES_DATA} postgres
}

function start_eums {
  docker run -d --name ${EUMS_WEB} \
  -p 8000:8000 \
  --env-file local.env \
  --link ${EUMS_POSTGRES}:postgres \
  --link ${EUMS_CONTACTS}:contacts \
  eums_web \
  "${@}"
}

function start_eums_prod {
  sleep 5
  start_eums
}

function start_eums_dev {
  sleep 5
  start_eums manage.py runserver 0.0.0.0:8000
}

function start_eums_celery {
  sleep 5
  docker run -d --name ${EUMS_REDIS} redis
  docker run -d --name ${EUMS_CELERY_WORKER} --env-file local.env --link ${EUMS_POSTGRES} --link ${EUMS_REDIS}:redis eums_web celery
}

function start_nginx {
  docker run -d --name ${EUMS_NGINX} -p 80:80 -p 443:443 --link ${EUMS_WEB}:web --link ${EUMS_CONTACTS}:contacts eums_nginx
}

function stop_containers {
  docker stop ${CONTAINER_NAMES}
}

function remove_containers {
  docker rm -v ${CONTAINER_NAMES}
}

function load_fixtures {
  PROJECT_DIR=$(pwd)

  docker run -i --rm \
  --volume ${PROJECT_DIR}:/eums/ \
  --env-file local.env \
  --link ${EUMS_POSTGRES}:postgres \
  --link ${EUMS_CONTACTS}:contacts \
  eums_web \
  manage.py shell_plus < client/test/functional/fixtures/mapdata_code.py

  curl -X POST -H "Content-Type: application/json" \
  -d '{ "firstName": "John", "lastName": "Doe", "phone": "+256771234567" }' \
  http://192.168.99.100/api/contacts/
}

case "${1}" in
  '' )
    echo 'Usage: eums-docker.sh {start|stop|clean|load}';;
  'start' )
    start_contacts
    start_postgres
    start_eums
    start_eums_celery
    start_nginx;;
  'start_dev' )
    start_contacts
    start_postgres
    start_eums_dev;;
  'stop' )
    stop_containers;;
  'clean' )
    remove_containers;;
  'load' )
    load_fixtures;;
esac
