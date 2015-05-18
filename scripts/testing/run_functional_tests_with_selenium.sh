#!/bin/bash

set -e

#build the code TODO: not sure this is needed
virtualenv ~/.virtualenvs/eums
source ~/.virtualenvs/eums/bin/activate
pip install -r requirements.txt

#Start the server
python manage.py migrate --settings=eums.snap_settings
python manage.py loaddata eums/client/test/functional/fixtures/user.json --settings=eums.snap_settings
python manage.py loaddata eums/client/test/functional/fixtures/mapdata.json --settings=eums.snap_settings
python manage.py runserver 0.0.0.0:8000 --settings=eums.snap_settings &

# Run the functional tests
cd eums/client
sudo npm install -g grunt-cli
npm install
bower install
grunt protractor:headless_selenium

#Kill the server
kill -9 $(lsof -t -i:8000)
