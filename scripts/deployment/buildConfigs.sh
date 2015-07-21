#!/bin/bash

#run the migrations
source ~/.virtualenvs/eums/bin/activate
cd /opt/app/eums
python manage.py syncdb --noinput
python manage.py migrate
python manage.py loaddata eums/fixtures/new-deployment-instance.json
deactivate

# Make sure we have the right IPs for the contacts service
cd /opt/app/eums/eums/client

grunt build-staging:$1
grunt build-staging:$1

HOST=$1

cd /opt/app/contacts
sed -i "s/stg.eum.unicefuganda.org/${HOST}/" config/config.json
