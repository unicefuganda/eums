#!/bin/bash

set -e

#Ensure that Docker and sshpass are installed
if [ ! -f /usr/local/bin/docker ] && [ ! -f /usr/bin/docker ]; then
    apt-get update

    apt-get -y install wget
    wget -qO- https://get.docker.com/ | sh

fi

if [ ! -f /usr/bin/sshpass ] && [ ! -f /usr/local/bin/sshpass ]; then
    apt-get -y install sshpass
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

echo "Stopping and remove the existing eums container"
#!/bin/bash
if [ $(sudo docker ps | grep eums | awk '{print$1}') ]; then
  sudo docker rm -f $(sudo docker ps | grep eums | awk '{print$1}')
fi


echo "Running image ..."
DEPLOY_MACHINE_HTTP_PORT=80
DEPLOY_MACHINE_SSH_PORT=50000
EUMS_CONTAINER_HOST_NAME=127.0.0.1

sudo docker run -p $DEPLOY_MACHINE_SSH_PORT:22 -p $DEPLOY_MACHINE_HTTP_PORT:80 \
-e "LC_ALL=C" \
-d --name=eums \
-v /opt/app/mongodb:/data/db \
-v /opt/app/postgresql:/var/lib/postgresql \
%IMAGENAME%:latest

echo "Done!"

#sleep 10s

#echo "Editing host name ..."
#sed -i -e "s/%EUMS_CONTAINER_HOST_NAME%/$EUMS_CONTAINER_HOST_NAME/g" scripts/eums.nginx.config

#echo "copying config file ..."
#sshpass -p 'password' scp -o StrictHostKeyChecking=no -P $DEPLOY_MACHINE_SSH_PORT scripts/eums.nginx.config root@0.0.0.0:/etc/nginx/sites-available/eums

#echo "Creating ln and restarting nginx ..."
#sshpass -p 'password' ssh -o StrictHostKeyChecking=no -p $DEPLOY_MACHINE_SSH_PORT root@0.0.0.0 'ln -sf /etc/nginx/sites-available/eums /etc/nginx/sites-enabled/eums && service nginx restart'

# uninstall ssh-pass
sudo apt-get -y --purge remove sshpass
