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

    python manage.py migrate
    python manage.py setup_permissions
    python manage.py shell_plus < eums/elasticsearch/run_sync.py
else
    echo postgres does NOT initialized, start to init db
    scripts/deployment/initdb.sh ${pgVersion} ${dataDir}
fi

deactivate