#!/bin/bash

set -e

#Ensure that Docker and sshpass are installed
if [ ! -f /usr/local/bin/docker ] || [ ! -f /usr/bin/sshpass ]; then
    apt-get update

    if [ ! -f /usr/local/bin/docker ]; then
    apt-get -y install docker.io;
    ln -sf /usr/bin/docker.io /usr/local/bin/docker
    sed -i '$acomplete -F _docker docker' /etc/bash_completion.d/docker.io
    update-rc.d docker.io defaults
    fi

    if [ ! -f /usr/bin/sshpass ]; then
    apt-get -y install sshpass
    fi

fi

echo "Loading docker image ..."
sudo docker load -i %IMAGEFILE%
echo "Done!"

if  [ ! -z $(sudo docker images | awk '/^unicef.%ARTIFACTNAME%[[:blank:]]+latest/ { print $3 }') ]; then
 echo "Tagging latest image as rollback ..."
 sudo docker tag -f %IMAGENAME%:latest %IMAGENAME%:rollback
 echo "Done!"
fi

echo "Tagging new image as latest ..."
sudo docker tag -f %IMAGENAME%:%IMAGEVERSION% %IMAGENAME%:latest
echo "Done!"

echo "Running image"
sudo docker run -p ${DEPLOY_MACHINE_SSH_PORT}:22 -p ${DEPLOY_MACHINE_HTTP_PORT}:80 -d %IMAGENAME%:latest
echo "Done!"

echo "Editing host name"
sshpass -p 'password' ssh -p ${DEPLOY_MACHINE_SSH_PORT} -o StrictHostKeyChecking=no root@0.0.0.0 'sed -i -e "s/%EUMS_CONTAINER_HOST_NAME%/${EUMS_CONTAINER_HOST_NAME}/g" /etc/nginx/sites-available/eums.nginx.conf && ln -s /etc/nginx/sites-available /etc/nginx/sites-enabled && supervisorctl restart nginx'

# uninstall ssh-pass
apt-get -y --purge remove sshpass