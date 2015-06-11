#!/bin/bash

pgVersion=$1

set -e

cd /opt/app/eums

#Replace pg config file to allow postgres to log in locally
cp scripts/packaging/pg_hba.conf /etc/postgresql/$pgVersion/main/pg_hba.conf
su - postgres -c "/etc/init.d/postgresql start"

#Give pg time to start up
sleep 30s

#setup the database
#psql -U postgres -t -P format=unaligned -c "create extension postgis;"
#psql -U postgres -t -P format=unaligned -c "create extension postgis_topology;"
#psql -U postgres -t -P format=unaligned -c "create extension hstore;"
createuser -U postgres -s -r -w root
createdb -U postgres -O postgres eums 
virtualenv ~/.virtualenvs/eums
source ~/.virtualenvs/eums/bin/activate
pip install -r requirements.txt
python manage.py syncdb --noinput
#python manage.py migrate --settings=eums.${eums.environment}_settings
#python manage.py loaddata eums/fixtures/new-deployment-instance.json --settings=${eums.environment}.snap_settings
python manage.py migrate
python manage.py loaddata eums/fixtures/new-deployment-instance.json

su - postgres -c "/etc/init.d/postgresql stop"

#sleep 4
