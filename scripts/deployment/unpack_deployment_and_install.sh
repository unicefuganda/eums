#!/bin/bash

set -e

today=$1
eums_host=$2
rapidpro_token=$3
email_password=$4
vision_user=$5
vision_password=$6
vision_business_area_code=$7
vision_purchase_group_code=$8
time_zone=$9
django_secret_key=${10}
latitude=${11}
longitude=${12}
level=${13}
admin_password=${14}

echo "Unpacking deployment directory..."
tar --force-local -xzvf deploy_latest.tar.gz

echo "Deleting zip file..."
rm deploy_latest.tar.gz

cd deploy_$today

chmod a+x scripts/*.sh

echo "Running install script..."
scripts/install-image-eums.sh "${eums_host}" "${rapidpro_token}" "${email_password}" "${vision_user}" \
"${vision_password}" "${vision_business_area_code}" "${vision_purchase_group_code}" \
"${time_zone}" "${django_secret_key}" "${latitude}" "${longitude}" "${level}" "${admin_password}"
