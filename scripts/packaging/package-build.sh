#!/bin/bash

artifactName=$GO_PIPELINE_NAME
artifactCounter=$GO_PIPELINE_COUNTER
gitRevision=$GO_REVISION

echo "Packaging for Artifact=$artifactName BuildCounter=$artifactCounter GitRevision=$gitRevision"

#Build and save the image
mkdir -p /opt/app/staging/$artifactName/$artifactCounter
sudo docker build -t unicef/$artifactName:$artifactCounter .
sudo docker save -o $artifactName_docker_image.tar unicef/$artifactName:$artifactCounter

#Prepare the script that will install the image
sed -i bak -e 's/%IMAGEFILE%/$artifactName_docker_image\.tar/g' scripts/packaging/install_image.sh
sed -i bak -e 's/%IMAGENAME%/unicef\/$artifactName/g' scripts/packaging/install_image.sh
sed -i bak -e 's/%IMAGEVERSION%/$artifactCounter/g' scripts/packaging/install_image.sh

