#!/bin/bash

set -e

today='eums_latest'

chmod +x build/deployment/*.sh

sudo build/deployment/pack_deployment.sh $today

if [ -d ./map ]; then
    echo "Copying the map file to server ..."
    rsync -q -e "ssh -q -o StrictHostKeyChecking=no" -r map ${DEPLOY_USER}@${DEPLOY_HOST}:/home/${DEPLOY_USER}/
fi

echo "Copying deployment directory to server ..."
rsync -q -e "ssh -q -o StrictHostKeyChecking=no" deploy_latest.tar.gz ${DEPLOY_USER}@${DEPLOY_HOST}:/home/${DEPLOY_USER}/

echo "Copying unpack script to server ..."
rsync -q -e "ssh -q -o StrictHostKeyChecking=no" build/deployment/unpack_deployment_and_install.sh ${DEPLOY_USER}@${DEPLOY_HOST}:/home/${DEPLOY_USER}/

echo "Removing all docker images on CI server except for the latest one..."
sudo docker images | grep -P '^\S+eums\s+([0-9]+)\b' | awk 'NR >=2 {print$3}' | xargs -I {} sudo docker rmi {} || true

echo "running the unpack script via ssh on the server ..."
ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd /home/${DEPLOY_USER}/ \
&& sudo ./unpack_deployment_and_install.sh \
$today '${EUMS_HOST}' '${RAPIDPRO_API_TOKEN}' '${EMAIL_PASSWORD}' \
'${VISION_USER}' '${VISION_PASSWORD}' '${VISION_BUSINESS_AREA_CODE}' \
'${TIME_ZONE}' '${DJANGO_SECRET_KEY}' '${MAP_LATITUDE}' '${MAP_LONGITUDE}' '${MAP_LEVEL}' '${ADMIN_PASSWORD}' \
'${SENTRY_DSN}'"
