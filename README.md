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

#Feature tests
When running feature tests with grunt make sure the local instance of djangoserver is not running, else they will likely fail since they will try run against the local instance.

Feature tests may also fail if you don't have chromedriver installed. If you use brew this can be done running

        $ brew install chromedriver

#Deployment
*On Ubuntu 14.04,

1. Add your public key to ~/.ssh/authorized_keys on the host server if you have not done this already

2. Install chef version 11.8.2

        $ apt-get install chef

3. Obtain the eums MailGun API key or Setup a [mailGun](https://mailgun.com) account and get its key. You will need this in the next step.

4. Create a text file with provisioning parameters. (host, user, ssh-key, etc). See scripts/sample-provisioning-params.txt for details.
    No comments are allowed in this file.

5. Run the installation script for eums
        
        $ ./scripts/staging.sh /path/to/your/provisioning-params.txt
        
        # Notes:
        - Use the API token for the RapidPro instance you want to connect the instance you are provisioning.
        - Not specifying the RapidPro token will cause provisioning not to replace your settings. Useful when you are re-provisioning an instance.

6. Go to the [contacts repo](https://github.com/unicefuganda/contacts) and follow the deployment instructions

7. The provisioning process creates flows and questions based on flow ids and node ids in the default End User and EUMS IP & Sub-consignees
   flows on the __UNICEF Uganda__ account. If you want to connect the app to another account, ensure that the flows from
   the __UNICEF Uganda__ account are transferred to your new account and that the ids of the flows and the questions in 
   your new EUMS instance's database match the flow ids and the node uuids in the new RapidPro account. If this is not done,
   your new EUMS instance will not be able to start flows and/or receive messages from end users.
   
   There are files under the __scripts__ directory to help with the translation. One is rapid-pro-id-translation.txt and the 
   other is translate_rapid_pro_ids.py. Add your translations to rapid-pro-id-translation.txt (instructions can be found therein) 
   then run 
        
        $ cd /home/eums/app/scripts
        $ ../manage.py runscript translate_rapid_pro_ids
       
   Your translation will be done.
