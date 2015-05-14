#!/bin/bash

today=`date +%Y-%m-%d.%H:%M:%S`

#push the image install script and docker-compose.yml and image to the target box
scp -r -i scripts/deployment/${DEPLOY_MACHINE_KEY_FILE} scripts ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/
scp -r -i scripts/deployment/${DEPLOY_MACHINE_KEY_FILE} *.tar ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/
scp -r -i scripts/deployment/${DEPLOY_MACHINE_KEY_FILE} docker-compose.yml ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/

#run the deployment script via ssh on the server
ssh -i scripts/deployment/${DEPLOY_MACHINE_KEY_FILE} "/deploy_$today/scripts/deployment/install-image.sh ~/deploy_$today"

