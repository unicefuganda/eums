#!/bin/sh
#EUMS Management script
set -e

EUMS_MONGO="eums_mongo"
EUMS_CONTACTS="eums_contacts"
EUMS_WEB="eums_web"
EUMS_POSTGRES="eums_postgres"
EUMS_NGINX="eums_nginx"
CONTAINER_NAMES="${EUMS_NGINX} ${EUMS_WEB} ${EUMS_POSTGRES} ${EUMS_CONTACTS} ${EUMS_MONGO}"

function create_contacts {
  docker create --name ${EUMS_MONGO} mongo
  docker create --name ${EUMS_CONTACTS} --link ${EUMS_MONGO}:mongo cuevee/contacts
}

function start_contacts {
  docker start ${EUMS_MONGO}
  docker start ${EUMS_CONTACTS}
}

function create_eums {
  docker create --name ${EUMS_POSTGRES} postgres
  docker create --name ${EUMS_WEB} --env-file local.env --link ${EUMS_POSTGRES}:postgres --link ${EUMS_CONTACTS}:contacts eums_web
}

function start_eums {
  docker start ${EUMS_POSTGRES}
  sleep 5
  docker start ${EUMS_WEB}
  sleep 5
}

function create_nginx {
  docker create --name ${EUMS_NGINX} -p 80:80 -p 443:443 --link ${EUMS_WEB}:web --link ${EUMS_CONTACTS}:contacts eums_nginx
}

function start_nginx {
  docker start ${EUMS_NGINX}
}

function stop_containers {
  docker stop ${CONTAINER_NAMES}
}

function remove_containers {
  docker rm ${CONTAINER_NAMES}
}

function load_fixtures {
  PROJECT_DIR="`pwd`"

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
    start_eums
    start_nginx;;
  'stop' )
    stop_containers;;
  'clean' )
    remove_containers;;
  'create' )
    create_contacts
    create_eums
    create_nginx;;
  'load' )
    load_fixtures;;
esac
