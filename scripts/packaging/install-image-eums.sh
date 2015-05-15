#!/bin/bash


docker load -i GO_PIPELINE_NAME_docker_image.tar
docker tag -f unicef/$artifactName:latest unicef/$artifactName:rollback
docker tag -f unicef/$artifactName:$artifactCounter unicef/$artifactName:latest


