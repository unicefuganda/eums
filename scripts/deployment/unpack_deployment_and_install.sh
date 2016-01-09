#!/bin/bash

set -e

today=$1
hostip=$2
rapidpro_token=$3
email_password=$4
vision_user=$5
vision_password=$6
secret_key=$7
latitude=$8
longitude=$9
level=${10}
time_zone=${11}
django_settings=${12}

echo "Unpacking deployment directory..."
tar --force-local -xzvf deploy_latest.tar.gz

echo "Deleting zip file..."
rm deploy_latest.tar.gz

cd deploy_$today

chmod a+x scripts/*.sh

echo "Running install script..."
scripts/install-image-eums.sh ${hostip} ${rapidpro_token} ${email_password} ${vision_user} \
${vision_password} ${secret_key} ${latitude} ${longitude} ${level} ${time_zone} \
${django_settings}