#Required environment variables
#eums.environment => name corresponding with the different settings files e.g. qa, snap, staging, test

#  Base OS
FROM ubuntu:14.04
MAINTAINER eums <eums@thoughtworks.com>

##############################################################################
## Change policy
##############################################################################
RUN echo exit 0 > /usr/sbin/policy-rc.d
RUN chmod +x /usr/sbin/policy-rc.d

RUN export DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y wget curl build-essential libpq-dev

##############################################################################
## Python 2.7.9 Pre-requisites
##############################################################################
# remove several traces of debian python
RUN apt-get purge -y python.*

# http://bugs.python.org/issue19846
# > At the moment, setting "LANG=C" on a Linux system *fundamentally breaks Python 3*, and that's not OK.
ENV LANG C.UTF-8

#The properties below are not used as parameters to facilitate docker caching and faster builds
#They have been left here more as doc so be sure to update them if you change the version
ENV PYTHON_VERSION 2.7.9

# gpg: key 18ADD4FF: public key "Benjamin Peterson <benjamin@python.org>" imported
RUN gpg --keyserver ha.pool.sks-keyservers.net --recv-keys C01E1CAD5EA2C4F0B8E3571504C367C218ADD4FF

RUN set -x \
	&& mkdir -p /usr/src/python \
	&& curl -SLO "https://www.python.org/ftp/python/2.7.9/Python-2.7.9.tar.xz" \
	&& curl -SLO "https://www.python.org/ftp/python/2.7.9/Python-2.7.9.tar.xz.asc"
RUN	gpg --verify Python-2.7.9.tar.xz.asc \
	&& tar -xJC /usr/src/python --strip-components=1 -f Python-2.7.9.tar.xz \
	&& rm Python-2.7.9.tar.xz* \
	&& cd /usr/src/python \
	&& ./configure --enable-shared --enable-unicode=ucs4 \
	&& make -j$(nproc) \
	&& make install \
	&& ldconfig
RUN curl -SL 'https://bootstrap.pypa.io/get-pip.py' | python2 \
	&& find /usr/local \
		\( -type d -a -name test -o -name tests \) \
		-o \( -type f -a -name '*.pyc' -o -name '*.pyo' \) \
		-exec rm -rf '{}' + \
	&& rm -rf /usr/src/python

RUN pip install virtualenv

RUN apt-get update && apt-get install -y supervisor openssh-server postgresql postgresql-contrib nodejs nginx redis-server git
RUN mkdir -p /var/lock/apache2 /var/run/apache2 /var/run/sshd /var/log/supervisor

RUN echo "root:password" | chpasswd  # need a password for ssh
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

##############################################################################
## install NodeJS
##############################################################################
# verify gpg and sha256: http://nodejs.org/dist/v0.10.30/SHASUMS256.txt.asc
# gpg: aka "Timothy J Fontaine (Work) <tj.fontaine@joyent.com>"
# gpg: aka "Julien Gilli <jgilli@fastmail.fm>"
RUN gpg --keyserver pool.sks-keyservers.net --recv-keys 7937DFD2AB06298B2293C3187D33FF9D0246406D 114F43EE0176B71C7BC219DD50A3051F888C628D

#The properties below are not used as parameters to facilitate docker caching and faster builds
#They have been left here more as doc so be sure to update them if you change the version
#ENV NODE_VERSION 0.10.21
#ENV NPM_VERSION 1.3.11

RUN curl -SLO "http://nodejs.org/dist/v0.10.21/node-v0.10.21-linux-x64.tar.gz"
RUN curl -SLO "http://nodejs.org/dist/v0.10.21/SHASUMS256.txt.asc"
RUN gpg --verify SHASUMS256.txt.asc
RUN grep " node-v0.10.21-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c -
RUN tar -xzf "node-v0.10.21-linux-x64.tar.gz" -C /usr/local --strip-components=1
RUN curl -SLO "http://nodejs.org/dist/v0.10.21/SHASUMS256.txt.asc"
RUN rm "node-v0.10.21-linux-x64.tar.gz" SHASUMS256.txt.asc
RUN npm install -g npm@1.4.28
RUN npm install -g npm@"1.3.11"
RUN npm install -g grunt-cli@0.1.13
RUN npm cache clear

##############################################################################
## Set up and initialise PostgresSQL DB
##############################################################################
#ENV LANGUAGE en_US.UTF-8
#ENV LANG en_US.UTF-8
#ENV LC_ALL en_US.UTF-8
#RUN dpkg-reconfigure locales
#RUN pg_createcluster 9.3 main --start

##############################################################################
## install MongoDB
##############################################################################
RUN sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
RUN sudo apt-get update
RUN apt-get install -y mongodb-org=2.6.5 mongodb-org-server=2.6.5 mongodb-org-shell=2.6.5 mongodb-org-mongos=2.6.5 mongodb-org-tools=2.6.5
ENV LC_ALL C

##############################################################################
# Install UWSGI
##############################################################################
RUN apt-get install -y python-dev
RUN pip install uwsgi
COPY ./eums/scripts/packaging/eums.uwsgi.ini /etc/uwsgi/sites/eums.uwsgi.ini

# copy nginx config files
COPY ./eums/scripts/packaging/nginx.config /etc/nginx/nginx.conf
COPY ./eums/scripts/packaging/eums.nginx.config /etc/nginx/sites-available/eums
RUN ln -sf /etc/nginx/sites-available/eums /etc/nginx/sites-enabled/eums
RUN rm /etc/nginx/sites-enabled/default

##############################################################################
## Add the codebase to the image
##############################################################################
# Add the code and dependencies
COPY ./eums /opt/app/eums

COPY ./contacts /opt/app/contacts
COPY ./contacts/scripts/startContacts.sh /opt/scripts/startContacts.sh
COPY ./eums/scripts/deployment/startPostgres.sh /opt/scripts/startPostgres.sh
COPY ./eums/scripts/deployment/buildConfigs.sh /opt/scripts/buildConfigs.sh
COPY ./eums/scripts/deployment/celery.sh /opt/scripts/celery.sh
RUN chmod a+x /opt/scripts/*.sh
RUN chmod a+x /opt/app/eums/scripts/**/*.sh
RUN sudo /opt/app/eums/scripts/packaging/initdb.sh 9.3


##############################################################################
# Install APP NPM and bower dependencies
##############################################################################
RUN cd /opt/app/eums/eums/client && npm install && npm install -g bower && bower install --allow-root && npm install -g grunt-cli

COPY ./eums/scripts/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./eums/scripts/supervisor/celeryd.conf /etc/supervisor/conf.d/celeryd.conf
RUN mkdir /var/log/celery && touch /var/log/celery/workers.log

VOLUME /var/lib/postgresql
VOLUME /data

EXPOSE 22 80 8005

##############################################################################
## Entrypoint and command parameters
##############################################################################
CMD ["/usr/bin/supervisord"]
