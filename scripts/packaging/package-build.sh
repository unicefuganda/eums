#!/bin/bash

set -e

artifactName="eums"
artifactCounter=$GO_PIPELINE_COUNTER
gitRevision=$GO_REVISION

echo "Packaging for Artifact=$artifactName BuildCounter=$artifactCounter GitRevision=$gitRevision"

if [ -f Dockerfile ]; then
    echo "Removing docker file ..."
    rm Dockerfile
fi

if [ -d build ]; then
    echo "Removing old build directory ..."
    rm -rf build
fi

cp eums/Dockerfile .
#Build and save the image
sudo docker build -t unicef/$artifactName:$artifactCounter .

mkdir build
sudo docker save -o build/$artifactName"_docker_image.tar" unicef/$artifactName:$artifactCounter

cp eums/scripts/packaging/install-image-eums.sh build/install-image-eums.sh
chmod +x build/install-image-eums.sh

echo "Preparing the script that will install the image ..."
sudo sed -i -e "s/%IMAGEFILE%/${artifactName}_docker_image\.tar/g" build/install-image-eums.sh
sudo sed -i -e "s/%ARTIFACTNAME%/${artifactName}/g" build/install-image-eums.sh
sudo sed -i -e "s/%IMAGENAME%/unicef\/${artifactName}/g" build/install-image-eums.sh
sudo sed -i -e "s/%IMAGEVERSION%/${artifactCounter}/g" build/install-image-eums.sh

cp -r eums/scripts/deployment build/deployment
chmod +x build/deployment/*.sh
