#!/bin/bash
KEY_LOCATION=""
USER=""
HOST_IP=""
RAPIDPRO_API_TOKEN=""
MAILGUN_ACCESS_KEY=""

DONE=false
until $DONE ;do
    read || DONE=true
    IFS="=" read -a line_parts <<< "${REPLY}"
    key=${line_parts[0]}
    value=${line_parts[1]}
    if [ "$key" == "KEY_LOCATION" ]; then
        KEY_LOCATION="${value}"
    elif [ "$key" == "USER" ]; then
        USER="${value}"
    elif [ "$key" == "HOST_IP" ]; then
        HOST_IP="${value}"
    elif [ "$key" == "RAPIDPRO_API_TOKEN" ]; then
        RAPIDPRO_API_TOKEN="${value}"
    elif [ "$key" == "MAILGUN_ACCESS_KEY" ]; then
        MAILGUN_ACCESS_KEY="${value}"
    fi
done < $1

echo "ssh into staging ..."
ssh -t -t -i ${KEY_LOCATION} ${USER}@${HOST_IP} << EOF

echo "change to root user"
sudo su

echo "Go to home"
cd /home

echo "remove previous code"
rm -rf eums-provisioning
source /etc/profile

echo "installing git"
apt-get install git -y

echo "installing chef"
#sudo DEBIAN_FRONTEND=noninteractive aptitude install -y -q chef

echo "installing ruby dev"
apt-get install ruby-dev

echo "install ruby shadow"
gem install ruby-shadow

echo "remove chef directory"
rm -rf /home/eums-staging/provisioning

echo "create chef directory"
mkdir -p /home/eums-staging/provisioning

echo "clone the provisoning repository"
git clone https://github.com/unicefuganda/eums-provisioning.git /home/eums-staging/provisioning

echo "Creating settings overrides"
if [ ${RAPIDPRO_API_TOKEN} ]
then
    /home/eums-staging/provisioning/chef/cookbooks/backend/files/default/create-settings-overrides.sh ${RAPIDPRO_API_TOKEN} ${HOST_IP} ${MAILGUN_ACCESS_KEY}
fi

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

cd /home/eums/app/eums/client
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