today = $1

echo "Creating deployment directory ..."
mkdir -p deploy_$today/scripts

echo "Copying deployment scripts ..."
cp -r build/deployment/* deploy_$today/scripts

echo "Copying other scripts ..."
cp build/*.sh deploy_$today/scripts

echo "Copying image ..."
cp build/*.tar deploy_$today/

echo "Zipping and compressing deployment directory ..."
tar -czvf deploy_$today.tar.gz deploy_$today

ech "Cleaning deployment directory ..."
rm -rf deploy_$today