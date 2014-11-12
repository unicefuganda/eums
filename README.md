#EUMS 
[![Build Status](https://snap-ci.com/unicefuganda/eums/branch/master/build_image)](https://snap-ci.com/unicefuganda/eums/branch/master)[![Coverage Status](https://img.shields.io/coveralls/unicefuganda/eums.svg)](https://coveralls.io/r/unicefuganda/eums)
====

End User Monitoring System

Installation
------------
* Postgres should be running "install postgresql from http://www.postgresql.org/download/"
* Ensure that postgres user exits" (createuser -s -r postgres)

##Git

        git clone https://github.com/unicefuganda/eums.git

        cd eums

        virtualenv eums
        
        source eums/bin/activate

        pip install -r requirements.txt

        cd eums/client

        "install node from http://nodejs.org/"

        npm install

        npm install -g bower

        bower install

        npm install -g grunt-cli

        grunt - tests should all pass

        cd ../..

        createdb -O postgres eums

        python manage.py syncdb --noinput

        python manage.py migrate

        python manage.py runserver

==

#Note:

Before you start up the server make sure you have redis-server installed and running 
##
        brew install redis
        
        redis-server
==

To install one of the fixtures (e.g. new_data.json), you will need to comment out the 'schedule_run_for(line_item)' line in the handlers.py file before running
##
        python manage.py loaddata new_data.json


To test:
##
        run python manage.py test


Done!! you're good to go :)

Filenaming convention:
* for tests: test_[[OBJECT]]_[[ACTION]].py
e.g: test_location_form.py, test_location_model.py, test_location_views.py
