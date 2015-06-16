#!/bin/bash

set -e

export PHANTOMJS_BIN=$(which phantomjs)

cd eums/client
sudo npm install -g grunt-cli
npm install
sudo npm install -g bower
bower install
grunt unit
