#Contacts & Mongo
docker run -d --name eums_mongo mongo
docker run -d --name eums_contacts --link eums_mongo:mongo cuevee/contacts

#EUMS Web & Postgres
docker run -d --name eums_postgres postgres
sleep 5
docker run -d --name eums_web --env-file local.env --link eums_postgres:postgres --link eums_contacts:contacts eums_web

#NGINX
docker run -d --name eums_nginx -p 80:80 -p 443:443 --link eums_web:web --link eums_contacts:contacts eums_nginx

docker run -i --rm \
--volume /Users/dewaldv/Projects/eums-project/eums/:/eums/ \
--env-file local.env \
--link eums_postgres:postgres \
--link eums_contacts:contacts \
eums_web \
manage.py shell_plus < client/test/functional/fixtures/mapdata_code.py
