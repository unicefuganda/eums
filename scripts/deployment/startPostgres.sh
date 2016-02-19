#!/bin/bash
pgVersion=9.3
dataDir=/var/lib/postgresql/${pgVersion}/main/

# Workaround for the  postgres certificate 'permission denied' issues
mkdir /etc/ssl/private-copy
mv /etc/ssl/private/* /etc/ssl/private-copy/
rm -r /etc/ssl/private
mv /etc/ssl/private-copy /etc/ssl/private
chmod -R 0700 /etc/ssl/private
chown -R postgres /etc/ssl/private

chown -Rf postgres:postgres /var/lib/postgresql
chmod -R 700 /var/lib/postgresql

cd /opt/app/eums
source ~/.virtualenvs/eums/bin/activate

if [ -d ${dataDir} ]; then
    #start the server
    su - postgres -c "/usr/lib/postgresql/${pgVersion}/bin/pg_ctl start -D ${dataDir}"

    sleep 15s
else
    echo postgres does NOT initialized, start to init db
    scripts/deployment/initdb.sh ${pgVersion} ${dataDir}
fi

python manage.py migrate
python manage.py setup_permissions
python manage.py shell_plus < eums/fixtures/cleanup_questions.py
python manage.py shell_plus < eums/fixtures/load_flows_and_questions.py
python manage.py shell_plus < eums/fixtures/init_basic_data.py
python manage.py runscript eums.fixtures.create_superuser_password --script-args="username=admin,password=${ADMIN_PASSWORD}"

while [ -z "`netstat -tln | grep -w 9200`" ]; do
  echo 'Waiting for ElasticSearch to start ...'
  sleep 1
  if [ $((timeout+=1)) -eq 10 ]; then
    break
  fi
done
python manage.py shell_plus < eums/elasticsearch/run_sync.py

deactivate
