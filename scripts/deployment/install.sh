#!/bin/bash

imageFile="$GO_PIPELINE_NAME.tar"
imageVersion=$GO_PIPELINE_COUNTER
imageName="unicef/$GO_PIPELINE_NAME"
deployFolder=$1




#Ensure that Docker is installed
if [ ! -f /usr/local/bin/docker ] || [ ! -f /usr/bin/sshpass ]; then
    apt-get update

    if [ ! -f /usr/local/bin/docker ]; then
    apt-get -y install docker.io;
    ln -sf /usr/bin/docker.io /usr/local/bin/docker
    sed -i '$acomplete -F _docker docker' /etc/bash_completion.d/docker.io
    update-rc.d docker.io defaults
    fi

    if [ ! -f /usr/bin/sshpass ]; then
    apt-get -y install sshpass --force-yes
    fi

fi

mkdir -p /opt/app/eums

#install the image
scripts/install-image-eums.sh

# uninstall ssh-pass
apt-get -y --purge remove sshpass
