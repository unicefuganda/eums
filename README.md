eums
====

End User Monitoring System

Installation
------------
* Postgres should be running and after cloning adjust localsettings.py accordingly for db setup 

##Git

        git clone https://github.com/unicefuganda/eums.git

        cd eums

        mkvirtualenv eums

        pip install -r requirements.txt

        python manage.py syncdb --noinput

        python manage.py migrate

        python manage.py runserver
        
==

* run test and harvest

Done!! you're good to go :)

Filenaming convention:
* for tests: test_[[OBJECT]]_[[ACTION]].py
e.g: test_location_form.py, test_location_model.py, test_location_views.py

====

[![Build Status](https://snap-ci.com/unicefuganda/eums/branch/master/build_image)](https://snap-ci.com/unicefuganda/eums/branch/master)
[![Coverage Status](https://img.shields.io/coveralls/unicefuganda/eums.svg)](https://coveralls.io/r/unicefuganda/eums)
