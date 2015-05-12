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
## Set up PostgresSQL DB
##############################################################################
RUN createuser -s -r postgres
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















EXPOSE 22 8001 5984 9200 80 3000 587


##############################################################################
## Entrypoint and command parameters
##############################################################################
#ENTRYPOINT ["/usr/bin/supervisord"]
#default options to pass to the entrypoint
CMD ["/usr/bin/supervisord"]





























































































































# Install Ruby 2.1.2, and related tools
RUN curl -sSL https://rvm.io/mpapis.asc | gpg --import -
RUN \curl -sSL https://get.rvm.io | bash -s stable
RUN /bin/bash -l -c "rvm requirements && rvm install 2.1.2 && rvm use ruby-2.1.2 --default && gem install bundler --no-ri --no-rdoc"

# Install Java.
RUN \
  apt-get install -y openjdk-7-jdk && \
  rm -rf /var/lib/apt/lists/*


# Define commonly used JAVA_HOME variable
ENV JAVA_HOME /usr/lib/jvm/java-7-openjdk-amd64


# Install Elasticsearch, CouchDB, Javascript and  plugins
ENV ES_PKG_NAME elasticsearch-1.1.1
RUN \
  cd / && \
  wget https://download.elasticsearch.org/elasticsearch/elasticsearch/$ES_PKG_NAME.tar.gz && \
  tar xvzf $ES_PKG_NAME.tar.gz && \
  rm -f $ES_PKG_NAME.tar.gz && \
  mv /$ES_PKG_NAME /elasticsearch
RUN /elasticsearch/bin/plugin -install mobz/elasticsearch-head
RUN /elasticsearch/bin/plugin -install elasticsearch/elasticsearch-lang-javascript/2.1.0
ADD elasticsearch-river-couchdb-2.1.0-CUSTOM.zip /elasticsearch-river-couchdb-2.1.0-CUSTOM.zip
RUN /elasticsearch/bin/plugin --url file:/elasticsearch-river-couchdb-2.1.0-CUSTOM.zip --install elasticsearch-river-couchdb-custom


# Define mountable directories.
VOLUME ["/data"]


# Install GPGME
# RUN apt-get install -y libgpgme11


# Add the code to the docker image
ADD . /home/app/bulamu-admin


# Install gems
RUN cd /home/app/bulamu-admin && /bin/bash -l -c "gem install pg -v '0.17.1'" && /bin/bash -l -c "bundle install --without development test"


# Add the run scripts
ADD scripts/run_elasticsearch.sh /run_elasticsearch.sh
ADD scripts/run_rake_tasks.sh /run_rake_tasks.sh
ADD scripts/run_server.sh /run_server.sh
RUN chmod 755 /*.sh


EXPOSE 22 8001 5984 9200 80 3000 587
CMD ["/usr/bin/supervisord"]
