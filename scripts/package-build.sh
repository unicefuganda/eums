#!/bin/bash

artifactName=$GO_PIPELINE_NAME
artifactCounter=$GO_PIPELINE_COUNTER
gitRevision=$GO_REVISION

echo "Packaging for Artifact=$artifactName BuildCounter=$artifactCounter GitRevision=$gitRevision"

mkdir -p /opt/app/staging/$artifactName/$artifactCounter
docker build -t thoughtworks/bulamu-admin:$artifactCounter . && \
docker save -o /opt/app/staging/$artifactName/$artifactCounter/eums_docker_image.tar thoughtworks/eums:$artifactCounter