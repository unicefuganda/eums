#!/bin/bash

set -e

artifactName=$GO_PIPELINE_NAME
artifactCounter=$GO_PIPELINE_COUNTER
gitRevision=$GO_REVISION

echo "Packaging for Artifact=$artifactName BuildCounter=$artifactCounter GitRevision=$gitRevision"

#Build and save the image
sudo docker build -t unicef/$artifactName:$artifactCounter .
mkdir build
sudo docker save -o build/$artifactName"_docker_image.tar" unicef/$artifactName:$artifactCounter

#Prepare the script that will install the image
sed -i -e "s/%IMAGEFILE%/${artifactName}_docker_image\.tar/g" scripts/packaging/install-image-eums.sh
sed -i -e "s/%IMAGENAME%/unicef\/${artifactName}/g" scripts/packaging/install-image-eums.sh
sed -i -e "s/%IMAGEVERSION%/${artifactCounter}/g" scripts/packaging/install-image-eums.sh

cp scripts/packaging/install-image-eums.sh build/install-image-eums.sh
cp -r scripts/deployment build/deployment

