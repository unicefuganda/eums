#!/bin/bash


docker load -i %IMAGEFILE%
docker tag -f %IMAGENAME%:latest %IMAGENAME%:rollback
docker tag -f %IMAGENAME%:%IMAGEVERSION% %IMAGENAME%:latest


