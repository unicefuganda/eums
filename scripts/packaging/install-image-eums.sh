#!/bin/bash

echo "Loading docker image ..."
docker load -i %IMAGEFILE%
echo "Done!"

echo "Tagging latest image as rollback ..."
docker tag -f %IMAGENAME%:latest %IMAGENAME%:rollback
echo "Done!"

echo "Tagging new image as latest ..."
docker tag -f %IMAGENAME%:%IMAGEVERSION% %IMAGENAME%:latest
echo "Done!"

echo "Running image"
docker run -p 50000:22 -p ${DEPLOY_MACHINE_PORT}:80 -d  %IMAGENAME%:%IMAGEVERSION% %IMAGENAME%:latest
echo "Done!"