#!/bin/bash

set -e

virtualenv eums_env
source eums_env/bin/activate
pip install -r requirements.txt
python manage.py migrate --settings=eums.snap_settings
cd eums/client
sudo npm install -g grunt-cli
npm install
bower install
grunt functional-staging
