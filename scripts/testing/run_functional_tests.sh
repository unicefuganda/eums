#!/bin/bash

set -e

virtualenv eums_env
source eums_env/bin/activate
pip install -r requirements.txt
cd eums/client
sudo npm install -g grunt-cli
npm install
bower install
grunt functional-staging
