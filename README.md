#EUMS 
[![Build Status](https://snap-ci.com/unicefuganda/eums/branch/master/build_image)](https://snap-ci.com/unicefuganda/eums/branch/master)[![Coverage Status](https://img.shields.io/coveralls/unicefuganda/eums.svg)](https://coveralls.io/r/unicefuganda/eums)
====

End User Monitoring System

Installation
------------
* Install and Setup PostgreSQL
	* For Mac Users, can run the following:
		*  `brew install postgres` - install with brew
		*  `postgres -D /usr/local/var/postgres` - start postgres server
	*  `createuser -s -r postgres` - create the `postgres` user
	*  `createdb -O postgres eums` - create the `eums` database

* Install [Node](http://nodejs.org/).

* Install chromedriver for running feature tests.
	* `brew install chromedriver` 

* A note on Python Virtual Environments
	* We recommend using and managing your virtual environments with [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/). 
	* If you are using a shared Virtual Environments directory that is not the default location used by virtualenvwrapper (~/.virtualenvs/), you will need to note this location for later use when running functional tests.

* Set up the project and install necessary packages

        # Clone the repository
        
        $ git clone https://github.com/unicefuganda/eums.git
        $ cd eums

        # Create and source your virtual environment in one of two ways:
        
        1) example using virtualenvwrapper

        $ source /usr/local/bin/virutalenvwrapper.sh
        $ mkvirtualenv eums
        
        2) example using virtualenv within project directory

        $ virtualenv eums
        $ source eums/bin/activate
        
        # Install necessary packages

        $ pip install -r requirements.txt
        $ cd eums/client
        $ npm install
        $ npm install -g bower
        $ bower install
        $ npm install -g grunt-cli
        
* Populate the database. Note to install one of the fixtures (e.g. new\_data.json), you will need to comment out the `schedule_run_for(line_item)` line in the `handlers.py` file before running the `loaddata` script below.

        $ cd to/the/project/root
        $ python manage.py syncdb --noinput
        $ python manage.py migrate
        $ python manage.py loaddata sample-data.json

* Run the tests to verify setup

        $ python manage.py test
        $ cd eums/client
        $ grunt
        
        # If your virtual environment is not at ~/.virtualenvs/, run:
        
        $ grunt --venvHome=relative/path/to/virtualenv/

* Start the redis server
        
        $ brew install redis
        $ redis-server

* Start the application server

        $ cd to/the/project/root
        $ python manage.py runserver
        

#Troubleshooting

* When running feature tests with grunt make sure the local instance of djangoserver is not running, else they will likely fail since they will try run against the local instance.

* When installing packages, we have seen node packages throw a `CERT_UNTRUSTED` error at times. This is due to a [strict SSL issue](http://bower.io/docs/config/#strict-ssl). In this case, you can add a `.bowerrc` file in the `eums/client` directory with the following contents:

        {
			"directory": "bower_components",
			"registry": "http://bower.herokuapp.com",
			"strict-ssl": false
		}
	
* At times, `npm` has been unable to set the PhantomJS binary to the correct path, even when installing globally. In this case, set it explicitly.

* Also note that the karma server and PhantomJS will both run on port `8080`. Make sure this port is free when running `grunt`.


#Deployments

For deployments, see the [Deployment Guide](https://github.com/unicefuganda/eums/wiki/Deployment-Guide).
