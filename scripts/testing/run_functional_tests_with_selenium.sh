#!/bin/bash

set -e

#Make sure any hanging instances of eums are dead
if [ $(lsof -t -i:8000) ]; then
   kill -9 $(lsof -t -i:8000)
fi


#build the code TODO: not sure this is needed
if [ ! -d ~/.virtualenvs/eums ]; then
   virtualenv ~/.virtualenvs/eums
fi

source ~/.virtualenvs/eums/bin/activate
pip install -r requirements.txt

# Run the functional tests
cd eums/client
sudo npm install -g grunt-cli
npm install
npm install bower
bower install
grunt build

#Start the server
cd ../../
dropdb --if-exists app_test
createdb app_test
python manage.py migrate --settings=eums.snap_settings
python manage.py loaddata eums/client/test/functional/fixtures/user.json --settings=eums.snap_settings
python manage.py loaddata eums/client/test/functional/fixtures/mapdata.json --settings=eums.snap_settings
python manage.py runserver 0.0.0.0:8000 --settings=eums.snap_settings &

# Run the functional tests
cd eums/client
grunt protractor:headless_selenium

#Kill the server
kill -9 $(lsof -t -i:8000)
