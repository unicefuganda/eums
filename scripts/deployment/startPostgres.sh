#!/bin/sh

# Workaround for the  postgres certificate 'permission denied' issues
mkdir /etc/ssl/private-copy
mv /etc/ssl/private/* /etc/ssl/private-copy/
rm -r /etc/ssl/private
mv /etc/ssl/private-copy /etc/ssl/private
chmod -R 0700 /etc/ssl/private
chown -R postgres /etc/ssl/private

#start the server
su - postgres -c "/etc/init.d/postgresql start"