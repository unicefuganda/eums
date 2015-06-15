today = $1
DEPLOY_USER = $2

echo "Un packing deployment directory ..."
tar -xzvf deploy_$today.tar.gz

echo "Deleting zip file"
rm deploy_$today.tar.gz

cd /home/$DEPLOY_USER/deploy_$today
&& chmod a+x scripts/*.sh &&

echo "Running install script ..."
scripts/install-image-eums.sh