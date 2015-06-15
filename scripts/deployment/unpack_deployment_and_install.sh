#!/bin/bash

set -e

today = $1

echo "Un packing deployment directory ..."
tar --force-local -xzvf deploy_latest.tar.gz

echo "Deleting zip file"
rm deploy_latest.tar.gz

cd deploy_$today

chmod a+x scripts/*.sh

echo "Running install script ..."
scripts/install-image-eums.sh