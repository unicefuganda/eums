#!/bin/bash

set -e

today=`date +%Y-%m-%d.%H:%M:%S`

if [ ! -f /usr/bin/sshpass ]; then
    apt-get -y install sshpass
fi

echo "Creating deployment directory ..."
sshpass -p "${DEPLOY_USER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ~/deploy_$today/scripts"

echo "Copying deployment scripts ..."
sshpass -p "${DEPLOY_USER_PASSWORD}" scp build/deployment/* ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/scripts

echo "Copying other scripts .."
sshpass -p "${DEPLOY_USER_PASSWORD}" scp build/*.sh ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/scripts

echo "Copying image .."
sshpass -p "${DEPLOY_USER_PASSWORD}" scp build/*.tar ${DEPLOY_USER}@${DEPLOY_HOST}:~/deploy_$today/


echo "running the deployment script via ssh on the server ..."
echo "export DEPLOY_MACHINE_HTTP_PORT=$DEPLOY_MACHINE_HTTP_PORT && DEPLOY_MACHINE_SSH_PORT=$DEPLOY_MACHINE_SSH_PORT && export EUMS_CONTAINER_HOST_NAME=$EUMS_CONTAINER_HOST_NAME && cd /home/${DEPLOY_USER}/deploy_$today && chmod a+x scripts/*.sh && scripts/install-image-eums.sh"
sshpass -p "${DEPLOY_USER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "export DEPLOY_MACHINE_HTTP_PORT=$DEPLOY_MACHINE_HTTP_PORT && DEPLOY_MACHINE_SSH_PORT=$DEPLOY_MACHINE_SSH_PORT && export EUMS_CONTAINER_HOST_NAME=$EUMS_CONTAINER_HOST_NAME && cd /home/${DEPLOY_USER}/deploy_$today && chmod a+x scripts/*.sh && scripts/install-image-eums.sh"

# uninstall ssh-pass
apt-get -y --purge remove sshpass