#!/bin/bash

artifactName=$GO_PIPELINE_NAME
artifactCounter=$GO_PIPELINE_COUNTER
gitRevision=$GO_REVISION

echo "Packaging for Artifact=$artifactName BuildCounter=$artifactCounter GitRevision=$gitRevision"

mkdir -p /opt/app/staging/$artifactName/$artifactCounter
sudo docker build -t unicef/$artifactName:$artifactCounter .
sudo docker save -o $artifactName_docker_image.tar unicef/$artifactName:$artifactCounter
