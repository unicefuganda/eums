#Required environment variables
#eums.environment => name corresponding with the different settings files e.g. qa, snap, staging, test

#  Base OS
FROM mdillon/postgis:9.4
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

##############################################################################
## Install NGINX
##############################################################################
#RUN apt-get -y install software-properties-common
#RUN apt-get install python3-software-properties
#RUN apt-get -y install python-software-properties
#RUN add-apt-repository ppa:guardianproject/ppa
#RUN apt-get -y update
#RUN apt-get -y install nginx
#ADD scripts/nginx.config /etc/nginx/nginx.conf
#ADD scripts/eums.nginx.config /etc/nginx/conf.d/eums-server.conf

#RUN apt-get -y install vim

##############################################################################
## Python 2.7.9 Pre-requisites
##############################################################################
# remove several traces of debian python
RUN apt-get purge -y python.*

# http://bugs.python.org/issue19846
# > At the moment, setting "LANG=C" on a Linux system *fundamentally breaks Python 3*, and that's not OK.
ENV LANG C.UTF-8

ENV PYTHON_VERSION 2.7.9

# gpg: key 18ADD4FF: public key "Benjamin Peterson <benjamin@python.org>" imported
RUN gpg --keyserver ha.pool.sks-keyservers.net --recv-keys C01E1CAD5EA2C4F0B8E3571504C367C218ADD4FF

RUN set -x \
	&& mkdir -p /usr/src/python \
	&& curl -SL "https://www.python.org/ftp/python/$PYTHON_VERSION/Python-$PYTHON_VERSION.tar.xz" -o python.tar.xz \
	&& curl -SL "https://www.python.org/ftp/python/$PYTHON_VERSION/Python-$PYTHON_VERSION.tar.xz.asc" -o python.tar.xz.asc
RUN	gpg --verify python.tar.xz.asc \
	&& tar -xJC /usr/src/python --strip-components=1 -f python.tar.xz \
	&& rm python.tar.xz* \
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

##############################################################################
## Add the codebase to the image
##############################################################################
# Add the code and dependencies
ADD . /opt/app/eums

##############################################################################
## Set up and initialise PostgresSQL DB
##############################################################################
ENV LANGUAGE en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
RUN pg_createcluster 9.4 main --start
ADD scripts/pg_hba.conf /pg_hba.conf



ADD scripts/initdb.sh /opt/scripts/initdb.sh
RUN chmod a+x /opt/scripts/initdb.sh
RUN /opt/scripts/initdb.sh 9.4


# migrate the database
#RUN python manage.py syncdb --noinput
#RUN python manage.py migrate --settings=eums.${eums.environment}_settings
#RUN python manage.py loaddata eums/fixtures/new-deployment-instance.json --settings=${eums.environment}.snap_settings

# Install NPM and bower dependencies
#RUN cd eums/client
#RUN npm install
#RUN npm install -g bower
#RUN bower install
#RUN npm install -g grunt-cli

EXPOSE 22 8000

##############################################################################
## Entrypoint and command parameters
##############################################################################
ADD scripts/startPostgresql.sh /opt/scripts/startPostgresql.sh
RUN chmod a+x /opt/scripts/startPostgresql.sh
#ENTRYPOINT ["/usr/bin/supervisord"]
#default options to pass to the entrypoint
CMD ["/usr/bin/supervisord"]

