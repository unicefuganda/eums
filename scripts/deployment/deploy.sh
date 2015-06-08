#!/bin/bash

today=`date +%Y-%m-%d.%H:%M:%S`

sshpass -p '${DEPLOY_USER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ~/deploy_$today/scripts"
sshpass -p '${DEPLOY_USER_PASSWORD}' scp build/deployment ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/scripts
sshpass -p '${DEPLOY_USER_PASSWORD}' scp build/*.sh ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/scripts
sshpass -p '${DEPLOY_USER_PASSWORD}' scp build/*.tar ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/


#run the deployment script via ssh on the server
sshpass -p '${DEPLOY_USER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd /home/${DEPLOY_USER}/deploy_$today && chmod a+x scripts/*.sh && scripts/deployment/install-image-eums.sh"
