#!/bin/bash

today=`date +%Y-%m-%d.%H:%M:%S`

#push the image install script and docker-compose.yml and image to the target box
chmod 600 ${DEPLOY_MACHINE_KEY_FILE}
ssh -o StrictHostKeyChecking=no -i ${DEPLOY_MACHINE_KEY_FILE} ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ~/deploy_$today/scripts"
scp -o StrictHostKeyChecking=no -r -i ${DEPLOY_MACHINE_KEY_FILE} build/deployment ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/scripts
scp -o StrictHostKeyChecking=no -r -i ${DEPLOY_MACHINE_KEY_FILE} build/*.sh ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/scripts
scp -o StrictHostKeyChecking=no -r -i ${DEPLOY_MACHINE_KEY_FILE} build/*.tar ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/

#run the deployment script via ssh on the server
ssh -o StrictHostKeyChecking=no -i ${DEPLOY_MACHINE_KEY_FILE} root@${DEPLOY_HOST} "cd /home/${DEPLOY_USER}/deploy_$today && chmod a+x scripts/*.sh && scripts/deployment/install.sh"
