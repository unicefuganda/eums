#!/bin/bash

echo "Loading docker image ..."
docker load -i %IMAGEFILE%
echo "Done!"

echo "Tagging latest image as rollback ..."
docker tag -f %IMAGENAME%:latest %IMAGENAME%:rollback
echo "Done!"

echo "Tagging new image as latest ..."
docker tag -f %IMAGENAME%:%IMAGEVERSION% %IMAGENAME%:latest
echo "Done!"

echo "Running image"
docker run -p ${DEPLOY_MACHINE_SSH_PORT}:22 -p ${DEPLOY_MACHINE_HTTP_PORT}:80 -d  %IMAGENAME%:%IMAGEVERSION% %IMAGENAME%:latest
echo "Done!"

echo "Editing host name"
sshpass -p 'password' ssh -p ${DEPLOY_MACHINE_SSH_PORT} root@0.0.0.0 'sed -i -e "s/%EUMS_HOST_NAME%/${EUMS_HOST_NAME}/g" /etc/nginx/sites-available/eums.nginx.conf && ln -s /etc/nginx/sites-available /etc/nginx/sites-enabled && supervisorctl restart nginx'
