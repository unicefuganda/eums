#!/bin/bash

set -e

today=$1
eums_host=$2
rapidpro_token=$3
email_password=$4
vision_user=$5
vision_password=$6
vision_business_area_code=$7
time_zone=$8
django_secret_key=$9
latitude=${10}
longitude=${11}
level=${12}

echo "Unpacking deployment directory..."
tar --force-local -xzvf deploy_latest.tar.gz

echo "Deleting zip file..."
rm deploy_latest.tar.gz

cd deploy_$today

chmod a+x scripts/*.sh

echo "Running install script..."
scripts/install-image-eums.sh "${eums_host}" "${rapidpro_token}" "${email_password}" "${vision_user}" \
"${vision_password}" "${vision_business_area_code}" "${time_zone}" "${django_secret_key}" "${latitude}" "${longitude}" "${level}"