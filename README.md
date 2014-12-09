#EUMS 
[![Build Status](https://snap-ci.com/unicefuganda/eums/branch/master/build_image)](https://snap-ci.com/unicefuganda/eums/branch/master)[![Coverage Status](https://img.shields.io/coveralls/unicefuganda/eums.svg)](https://coveralls.io/r/unicefuganda/eums)
====

End User Monitoring System

Installation
------------
* Postgres should be running "install postgresql from http://www.postgresql.org/download/"
* Ensure that postgres user exits" (createuser -s -r postgres)

##Git

        $ git clone https://github.com/unicefuganda/eums.git

        $ cd eums

        $ virtualenv eums
        
        $ source eums/bin/activate

        $ pip install -r requirements.txt

        $ cd eums/client

        "install node from http://nodejs.org/"

        $ npm install

        $ npm install -g bower

        $ bower install

        $ npm install -g grunt-cli

        $ grunt - tests should all pass

        $ cd ../..

        $ createdb -O postgres eums

        $ python manage.py syncdb --noinput

        $ python manage.py migrate

        $ python manage.py runserver

==

#Note

Before you start up the server make sure you have redis-server installed and running 
        
        $ brew install redis
        
        $ redis-server
==

To install one of the fixtures (e.g. new_data.json), you will need to comment out the 'schedule_run_for(line_item)' line in the handlers.py file before running
        
        $ python manage.py loaddata sample-data.json

To test
        
        $ python manage.py test

File naming convention:
* for tests: test_[[OBJECT]]_[[ACTION]].py
e.g: test_location_form.py, test_location_model.py, test_location_views.py

#Deployment
*Use Ubuntu 14.04 Operating System

1. Add your public key to ~/.ssh/authorized_keys on the host server if you have not done this already

2. Install chef version 11.8.2

        $ apt-get install chef

3. Run the installation script for eums
        
        $ ./scripts/staging.sh <PRIVATE_KEY> <USER> <HOST_ADDRESS> <RAPIDPRO_API_TOKEN>
        
        # Example
        $ ./scripts/staging.sh ~/.ssh/id_rsa eums 190.34.56.23 abscdf234352m324kladj602901mdsf0
        
        # Notes:
        - Use the API token for the RapidPro instance you want to connect the instance you are provisioning.
        - Not specifying the RapidPro token will cause provisioning not to replace your settings. Useful when you are re-provisioning an instance.

4. Go to the [contacts repo](https://github.com/unicefuganda/contacts) and follow the deployment instructions