EUMS
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

* run python manage.py test

Done!! you're good to go :)

Filenaming convention:
* for tests: test_[[OBJECT]]_[[ACTION]].py
e.g: test_location_form.py, test_location_model.py, test_location_views.py

====

[![Build Status](https://snap-ci.com/unicefuganda/eums/branch/master/build_image)](https://snap-ci.com/unicefuganda/eums/branch/master)
[![Coverage Status](https://img.shields.io/coveralls/unicefuganda/eums.svg)](https://coveralls.io/r/unicefuganda/eums)
[ ![Codeship Status for unicefuganda/eums](https://codeship.io/projects/0a030d30-2b87-0132-280f-02633035c302/status)](https://codeship.io/projects/38576)
