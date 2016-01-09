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
VISION_BUSINESS_AREA_CODE=$6
TIME_ZONE=$7


cd /opt/app/contacts
sed -i "s/stg.eum.unicefuganda.org/${HOST}/" config/config.json

cd /opt/app/eums/eums
sed -i -e "s/os.getenv('RAPIDPRO_API_TOKEN', 'invalid_token_if_no_token')/'${RAPIDPRO_API_TOKEN}'/g" settings.py
sed -i -e "s/os.getenv('EMAIL_PASSWORD', 'invalid_if_no_email')/'${EMAIL_PASSWORD}'/g" settings.py
sed -i -e "s/os.getenv('VISION_USER', 'invalid_vision_user')/r'${VISION_USER}'/g" settings.py
sed -i -e "s/os.getenv('VISION_PASSWORD', 'invalid_vision_password')/r'${VISION_PASSWORD}'/g" settings.py
sed -i -e "s/os.getenv('VISION_BUSINESS_AREA_CODE', 'invalid_code')/'${VISION_BUSINESS_AREA_CODE}'/g" settings.py
sed -i -e "s/os.getenv('VISION_COUNTRY_CODE', 'invalid_code')/'${VISION_BUSINESS_AREA_CODE:0:3}'/g" settings.py
sed -i -e "s|os.getenv('TIME_ZONE', 'Africa/Kampala')|'${TIME_ZONE}'|g" settings.py
