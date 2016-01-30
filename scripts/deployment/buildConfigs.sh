#!/bin/bash

set -e

cd /opt/app/eums/eums/client
grunt build-staging:$1
grunt build-staging:$1

EUMS_HOST=$1
RAPIDPRO_API_TOKEN=$2
EMAIL_PASSWORD=$3
VISION_USER=$4
VISION_PASSWORD=$5
VISION_BUSINESS_AREA_CODE=$6
TIME_ZONE=$7
DJANGO_SECRET_KEY=$8
GA_TRACKING_ID=$9
SENTRY_DSN=${10}


cd /opt/app/contacts
sed -i "s/stg.eum.unicefuganda.org/${EUMS_HOST}/" config/config.json

cd /opt/app/eums/eums
sed -i -e "s/os.getenv('RAPIDPRO_API_TOKEN', 'invalid_token_if_no_token')/'${RAPIDPRO_API_TOKEN}'/g" settings.py
sed -i -e "s/os.getenv('EMAIL_PASSWORD', 'invalid_if_no_email')/'${EMAIL_PASSWORD}'/g" settings.py
sed -i -e "s/os.getenv('VISION_USER', 'invalid_vision_user')/r'${VISION_USER}'/g" settings.py
sed -i -e "s/os.getenv('VISION_PASSWORD', 'invalid_vision_password')/r'${VISION_PASSWORD}'/g" settings.py
sed -i -e "s/os.getenv('VISION_BUSINESS_AREA_CODE', 'invalid_code')/'${VISION_BUSINESS_AREA_CODE}'/g" settings.py
sed -i -e "s/os.getenv('VISION_COUNTRY_CODE', 'invalid_code')/'${VISION_BUSINESS_AREA_CODE:0:3}'/g" settings.py
sed -i -e "s|os.getenv('TIME_ZONE', 'Africa/Kampala')|'${TIME_ZONE}'|g" settings.py
sed -i -e "s/os.getenv('SECRET_KEY', 'invalid_secret_key')/'`echo ${DJANGO_SECRET_KEY} | sed 's#\&#\\\&#g'`'/g" settings.py
sed -i -e "s/os.getenv('DJANGO_ALLOWED_HOST', 'invalid_allowed_host')/'${EUMS_HOST}'/g" settings.py

cd /opt/app/eums/eums/templates
sed -i -e "s/'invalid_sentry_dsn'/'${SENTRY_DSN}'/g" index.html
sed -i -e "s/'invalid_tracking_id'/'${GA_TRACKING_ID}'/g" index.html
