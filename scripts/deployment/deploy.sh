#!/bin/bash

set -e

today='eums_latest'

if [ ! -f /usr/bin/sshpass ]; then
    sudo apt-get -y install sshpass --force-yes
fi

sudo build/deployment/pack_deployment.sh $today

if [ -d ./map ]; then
    echo "Copying the map file to server ..."
    sshpass -p "${DEPLOY_USER_PASSWORD}" scp -r map ${DEPLOY_USER}@${DEPLOY_HOST}:/home/${DEPLOY_USER}/
fi

echo "Copying deployment directory to server ..."
sshpass -p "${DEPLOY_USER_PASSWORD}" scp -o StrictHostKeyChecking=no deploy_latest.tar.gz ${DEPLOY_USER}@${DEPLOY_HOST}:/home/${DEPLOY_USER}/

echo "Copying unpack script to server ..."
sshpass -p "${DEPLOY_USER_PASSWORD}" scp build/deployment/unpack_deployment_and_install.sh ${DEPLOY_USER}@${DEPLOY_HOST}:/home/${DEPLOY_USER}/

echo "running the unpack script via ssh on the server ..."
sshpass -p "${DEPLOY_USER_PASSWORD}" ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd /home/${DEPLOY_USER}/ \
&& sudo ./unpack_deployment_and_install.sh \
$today '${EUMS_HOST}' '${RAPIDPRO_API_TOKEN}' '${EMAIL_PASSWORD}' \
'${VISION_USER}' '${VISION_PASSWORD}' '${VISION_BUSINESS_AREA_CODE}' '${TIME_ZONE}' '${DJANGO_SECRET_KEY}' \
'${MAP_LATITUDE}' '${MAP_LONGITUDE}' '${MAP_LEVEL}'"

# uninstall ssh-pass
sudo apt-get -y --purge remove sshpass