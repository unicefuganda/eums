#!/bin/bash

set -e

today=`date +%Y-%m-%d.%H:%M:%S`

if [ ! -f /usr/bin/sshpass ]; then
    sudo apt-get -y install sshpass
fi

sudo scripts/pack_deployment.sh $today

echo "Copying image .."
sshpass -p "${DEPLOY_USER_PASSWORD}" scp -o StrictHostKeyChecking=no deploy_$today.tar.gz ${DEPLOY_USER}@${DEPLOY_HOST}:~/


echo "running the unpack script via ssh on the server ..."
sshpass -p "${DEPLOY_USER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "export DEPLOY_MACHINE_HTTP_PORT=$DEPLOY_MACHINE_HTTP_PORT && export DEPLOY_MACHINE_SSH_PORT=$DEPLOY_MACHINE_SSH_PORT && export EUMS_CONTAINER_HOST_NAME=$EUMS_CONTAINER_HOST_NAME && sudo unpack_deployment_and_install.sh $today ${DEPLOY_USER}"

# uninstall ssh-pass
sudo apt-get -y --purge remove sshpass