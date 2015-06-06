#!/bin/bash

set -e

#Make sure any hanging instances of eums are dead
if [ $(lsof -t -i:8000) ]; then
echo "kiling it maaaan"
   kill -9 $(lsof -t -i:8000)
fi

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
