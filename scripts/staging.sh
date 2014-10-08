#!/bin/bash
echo "ssh into staging"
ssh -t -t -i $HOME/.ssh/id_rsa_staging staging@196.0.26.51 << EOF
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
echo "list contents of file"
echo "provision eums to staging"
chef-solo -o role[all-in-one]
rm /etc/chef/solo.rb
echo 'cookbook_path "/home/contacts-service/provisioning/chef/cookbooks"' >> /etc/chef/solo.rb
echo 'role_path ["/home/contacts-service/provisioning/chef/roles"'] >> /etc/chef/solo.rb
echo "list contents of file"
echo "provision eums to staging"
chef-solo -o role[all-in-one]
echo "admin credentials"
killall -9 nginx
service nginx restart
exit
exit
EOF

