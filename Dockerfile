#Required environment variables
#eums.environment => name corresponding with the different settings files e.g. qa, snap, staging, test

#  Base OS
FROM ubuntu:14.04
MAINTAINER eums <eums@thoughtworks.com>

##############################################################################
## install and configure supervisor
##############################################################################
RUN export DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y openssh-server supervisor wget curl build-essential postgresql postgresql-contrib libpq-dev nodejs
RUN mkdir -p /var/lock/apache2 /var/run/apache2 /var/run/sshd /var/log/supervisor
COPY scripts/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN echo "root:password" | chpasswd  # need a password for ssh
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

RUN apt-get install git -y
RUN git clone https://github.com/unicefuganda/eums-provisioning.git /var/www/eums-provisioning

##############################################################################
## Install NGINX
##############################################################################
RUN apt-get -y install software-properties-common
RUN add-apt-repository ppa:guardianproject/ppa
RUN apt-get -y update
RUN apt-get -y install nginx
ADD scripts/nginx.config /etc/nginx/nginx.conf
ADD scripts/eums.nginx.config /etc/nginx/conf.d/eums-server.conf


##############################################################################
## Set up PostgresSQL DB
##############################################################################
ENV LANGUAGE en_US.UTF-8
ENV LANG  en_US.UTF-8
ENV LC_ALL en_US.UTF-8
RUN locale-gen en_US.UTF-8 && dpkg-reconfigure locales
RUN /etc/init.d/postgresql start
RUN createdb -O postgres eums


##############################################################################
## Python Pre-requisites
##############################################################################
RUN wget https://bootstrap.pypa.io/get-pip.py
RUN python get-pip.py
RUN pip install virtualenv

##############################################################################
## Add the codebase to the image
##############################################################################
# Add the code and dependencies
ADD . /opt/app/eums
RUN virtualenv ~/.virtualenvs/eums
RUN source ~/.virtualenvs/eums/bin/activate
RUN pip install -r requirements.txt

# migrate the database
RUN python manage.py syncdb --noinput
RUN python manage.py migrate --settings=eums.${eums.environment}_settings
RUN python manage.py loaddata eums/fixtures/new-deployment-instance.json --settings=${eums.environment}.snap_settings

# Install NPM and bower dependencies
RUN cd eums/client
RUN npm install
RUN npm install -g bower
RUN bower install
RUN npm install -g grunt-cli

EXPOSE 22 8000

##############################################################################
## Entrypoint and command parameters
##############################################################################
#ENTRYPOINT ["/usr/bin/supervisord"]
#default options to pass to the entrypoint
CMD ["/usr/bin/supervisord"]

