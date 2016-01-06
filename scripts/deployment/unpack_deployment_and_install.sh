#!/bin/bash

set -e

today=$1
hostip=$2
rapidpro_token=$3
email_password=$4
vision_user=$5
vision_password=$6
secret_key=$7

echo "Unpacking deployment directory..."
tar --force-local -xzvf deploy_latest.tar.gz

echo "Deleting zip file..."
rm deploy_latest.tar.gz

cd deploy_$today

chmod a+x scripts/*.sh

echo "Running install script..."
scripts/install-image-eums.sh ${hostip} ${rapidpro_token} ${email_password} ${vision_user} ${vision_password} ${secret_key}