#!/bin/bash

imageFile="$GO_PIPELINE_NAME.tar"
imageVersion=$GO_PIPELINE_COUNTER
imageName="unicef/$GO_PIPELINE_NAME"


sudo su

#Ensure that Docker is installed
if [ ! -f /usr/local/bin/docker ]; then
    #install docker
    apt-get update
    apt-get -y install docker.io
    ln -sf /usr/bin/docker.io /usr/local/bin/docker
    sed -i '$acomplete -F _docker docker' /etc/bash_completion.d/docker.io
    update-rc.d docker.io defaults

    #install fig
    curl -L https://github.com/docker/fig/releases/download/1.0.1/fig-`uname -s`-`uname -m` > /usr/local/bin/fig; chmod +x /usr/local/bin/fig
fi

docker load -i $imageFile
docker tag -f $imageName:latest $imageName:rollback
docker tag -f $imageName:$imageVersion $imageName:latest

#place the