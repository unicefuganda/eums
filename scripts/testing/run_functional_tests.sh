#!/bin/bash

set -e

virtualenv eums_env
source eums_env/bin/activate
pip install -r requirements.txt
dropdb eums_test
createdb eums_test
cd eums/client
sudo npm install -g grunt-cli
npm install
bower install
grunt functional
