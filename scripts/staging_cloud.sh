#!/bin/bash
echo "ssh into cloud staging"
ssh -t -t -i $HOME/.ssh/cloud_id_rsa azureuser@eums.cloudapp.net << EOF
echo "change to root user"
sudo su
echo "Go to home"
cd /home
echo "remove previous code"
rm -rf eums-provisioning
source /etc/profile
echo "clone the provisoning repository"
git clone https://github.com/unicefuganda/eums-provisioning.git
echo "create chef directory"
mkdir -p /home/eums-staging/provisioning/chef/
echo "copy cookbooks and roles to chef directory"
cp -ar eums-provisioning/chef/cookbooks /home/eums-staging/provisioning/chef/
cp -ar eums-provisioning/chef/roles /home/eums-staging/provisioning/chef/
echo "add cookbook and roles path to solo.rb"
rm /etc/chef/solo.rb
echo 'cookbook_path "/home/eums-staging/provisioning/chef/cookbooks"' >> /etc/chef/solo.rb
echo 'role_path "/home/eums-staging/provisioning/chef/roles"' >> /etc/chef/solo.rb
echo "provision eums to staging"
chef-solo -o role[staging]
echo 'replacing settings file'

if test -f "/home/staging-files/settings.py";
    then cp /home/staging-files/settings.py  /home/eums/app/eums/local_settings.py
fi

if test -f "/home/staging-files/staging.json";
    then cp /home/staging-files/staging.json  /home/eums/app/eums/client/config/staging.json
fi

cwd "/home/eums/app/eums/client"
grunt build-staging

echo "restart uwsgi"
killall -9 uwsgi
service uwsgi restart

echo "restart nginx"
killall -9 nginx
service nginx restart
exit
exit
EOF
