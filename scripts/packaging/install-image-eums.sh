#!/bin/bash

set -e

#Ensure that Docker and sshpass are installed
if [ ! -f /usr/local/bin/docker ] && [ ! -f /usr/bin/docker ]; then
    apt-get update

    apt-get -y install wget
    wget -qO- https://get.docker.com/ | sh
fi

if [ ! -f /usr/bin/sshpass ] && [ ! -f /usr/local/bin/sshpass ]; then
    apt-get -y install sshpass --force-yes
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
HOST_IP=$1
RAPIDPRO_API_TOKEN=$2
EMAIL_PASSWORD=$3
VISION_USER=$4
VISION_PASSWORD=$5
SECRET_KEY=$6

sudo docker run -p 50000:22 -p 80:80 -p 8005:8005 -p 9200:9200 \
-e "LC_ALL=C" \
-e "RAPIDPRO_API_TOKEN=${RAPIDPRO_API_TOKEN}" \
-e "EMAIL_PASSWORD=${EMAIL_PASSWORD}" \
-e "VISION_USER=${VISION_USER}" \
-e "VISION_PASSWORD=${VISION_PASSWORD}" \
-e "SECRET_KEY=${SECRET_KEY}" \
-d --name=eums \
-v /opt/app/mongodb:/data/db \
-v /opt/app/postgresql:/var/lib/postgresql \
%IMAGENAME%:latest \
/bin/bash -c "opt/scripts/buildConfigs.sh ${HOST_IP} ${RAPIDPRO_API_TOKEN} ${EMAIL_PASSWORD} ${VISION_USER} ${VISION_PASSWORD} ${SECRET_KEY}&& /usr/bin/supervisord && service elasticsearch start"

echo "Cleaning older eums docker images..."
sudo docker images | grep -P '^\S+eums\s+([0-9]+)\b' | awk 'NR >=3 {print$3}' | xargs -I {} sudo docker rmi {} || true

echo "Cleaning unused docker images..."
sudo docker images | grep -e '^<none>' | awk '{print$3}' | xargs -I {} sudo docker rmi {} || true

echo "Done!"
