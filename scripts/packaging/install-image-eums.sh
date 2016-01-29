#!/bin/bash

set -e

# Ensure that Docker is installed
if [ ! -f /usr/local/bin/docker ] && [ ! -f /usr/bin/docker ]; then
    apt-get update

    apt-get -y install wget
    wget -qO- https://get.docker.com/ | sh
fi

echo "Loading docker image..."
sudo docker load -i %IMAGEFILE%

if  [ ! -z $(sudo docker images | awk '/^unicef.%ARTIFACTNAME%[[:blank:]]+latest/ { print $3 }') ]; then
 echo "Tagging latest image as rollback..."
 sudo docker tag -f %IMAGENAME%:latest %IMAGENAME%:rollback
fi

echo "Tagging new image as latest..."
sudo docker tag -f %IMAGENAME%:%IMAGEVERSION% %IMAGENAME%:latest

echo "Stopping and removing existing eums container..."
if [ $(sudo docker ps -a | grep eums | awk '{print$1}') ]; then
  sudo docker rm -f $(sudo docker ps -a | grep eums | awk '{print$1}')
fi

echo "Running image..."
EUMS_HOST=$1
RAPIDPRO_API_TOKEN=$2
EMAIL_PASSWORD=$3
VISION_USER=$4
VISION_PASSWORD=$5
VISION_BUSINESS_AREA_CODE=$6
TIME_ZONE=$7
DJANGO_SECRET_KEY=$8
LATITUDE=$9
LONGITUDE=${10}
ZOOM_LEVEL=${11}
ADMIN_PASSWORD=${12}
SENTRY_DSN=${13}

USER_DIR=`eval echo ~/`

sudo docker run -p 50000:22 -p 80:80 -p 8005:8005 -p 9200:9200 \
-e "LC_ALL=C" \
-e "ADMIN_PASSWORD=${ADMIN_PASSWORD}" \
-e "SENTRY_DSN=${SENTRY_DSN}" \
-d --name=eums \
-v ${USER_DIR}/map:/opt/map \
-v /opt/app/mongodb:/data/db \
-v /opt/app/postgresql:/var/lib/postgresql \
-v /opt/app/uploads:/opt/app/eums/eums/uploads \
%IMAGENAME%:latest \
/bin/bash -c "opt/scripts/setupmap/setup-map.sh '${LATITUDE}' '${LONGITUDE}' '${ZOOM_LEVEL}' \
&& opt/scripts/buildConfigs.sh '${EUMS_HOST}' '${RAPIDPRO_API_TOKEN}' '${EMAIL_PASSWORD}' \
'${VISION_USER}' '${VISION_PASSWORD}' '${VISION_BUSINESS_AREA_CODE}' '${TIME_ZONE}' '${DJANGO_SECRET_KEY}' \
&& /usr/bin/supervisord"

echo "Cleaning older eums docker images..."
sudo docker images | grep -P '^\S+eums\s+([0-9]+)\b' | awk 'NR >=3 {print$3}' | xargs -I {} sudo docker rmi {} || true

echo "Cleaning unused docker images..."
sudo docker images | grep -e '^<none>' | awk '{print$3}' | xargs -I {} sudo docker rmi {} || true

echo "Done!"
