#!/bin/bash

set -e

# Make sure we have the right IPs for the contacts service
echo "Making sure we have the right IPs for the contacts service ..."
cd /opt/app/eums/eums/client

grunt build-staging:$1
grunt build-staging:$1

HOST=$1
RAPIDPRO_API_TOKEN=$2
EMAIL_PASSWORD=$3
VISION_USER=$4
VISION_PASSWORD=$5

cd /opt/app/contacts
sed -i "s/stg.eum.unicefuganda.org/${HOST}/" config/config.json

cd /opt/app/eums/eums
sed -i -e "s/os.getenv('RAPIDPRO_API_TOKEN', 'invalid_token_if_no_token')/'${RAPIDPRO_API_TOKEN}'/g" settings.py
sed -i -e "s/os.getenv('EMAIL_PASSWORD', 'invalid_if_no_email')/'${EMAIL_PASSWORD}'/g" settings.py

user=$(echo ${VISION_USER} | sed "s|\\\|\\\\\\\\\\\\|g")
sed -i -e "s/os.getenv('VISION_USER', 'invalid_vision_user')/r'${user}'/g" settings.py
password=$(echo ${VISION_PASSWORD} | sed "s|\\\|\\\\\\\\\\\\|g")
sed -i -e "s/os.getenv('VISION_PASSWORD', 'invalid_vision_password')/r'${password}'/g" settings.py