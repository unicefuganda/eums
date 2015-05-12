#!/bin/bash

artifactName=$1
artifactCounter=$2
gitRevision=$3

echo "Packaging for Artifact=$artifactName BuildCounter=$artifactCounter GitRevision=$gitRevision"

mkdir -p /opt/app/staging/$artifactName/$artifactCounter
docker build -t thoughtworks/bulamu-admin:$artifactCounter . && \
docker save -o /opt/app/staging/$artifactName/$artifactCounter/eums_docker_image.tar thoughtworks/eums:$artifactCounter