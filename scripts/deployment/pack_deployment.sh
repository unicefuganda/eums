#!/bin/bash

set -e

today=$1

echo "Creating deployment directory ..."
mkdir -p deploy_$today/scripts

echo "Copying deployment scripts ..."
cp -r build/deployment/* deploy_$today/scripts

echo "Copying other scripts ..."
cp build/*.sh deploy_$today/scripts

echo "Copying image ..."
cp build/*.tar deploy_$today/

if [ -f deploy_latest.tar.gz ]; then
   rm deploy_latest.tar.gz
fi

echo "Zipping and compressing deployment directory ..."
tar --force-local -czvf deploy_latest.tar.gz deploy_$today

echo "Cleaning deployment directory ..."
rm -rf deploy_$today

