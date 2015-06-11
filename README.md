#EUMS 
[![Build Status](https://snap-ci.com/unicefuganda/eums/branch/master/build_image)](https://snap-ci.com/unicefuganda/eums/branch/master) [![Coverage Status](https://img.shields.io/coveralls/unicefuganda/eums.svg)](https://coveralls.io/r/unicefuganda/eums)
====

End User Monitoring System

Installation
------------
* Install and Setup PostgreSQL
	* For Mac users, run the following:
		*  `brew install postgres` - Install Postgres using homebrew
		*  `postgres -D /usr/local/var/postgres` - Start the postgres server
	*  `createuser -s -r postgres` - Create the `postgres` user
	*  `createdb -O postgres eums` - Create the `eums` database

* Install [Node](http://nodejs.org/).

* Install chromedriver for running feature tests.
	* `brew install chromedriver` 

* A note on Python Virtual Environments:
	* We recommend using and managing your virtual environments with [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/). 
	* If you are using a shared Virtual Environments directory that is not the default location used by virtualenvwrapper `~/.virtualenvs/`, you will need to note this location for later use when running functional tests.

* Set up the project and install necessary packages:

	* Clone the repository
	
		```
		$ git clone https://github.com/unicefuganda/eums.git
		cd eums
		```
	* Create and source your virtual environment in one of two ways:
        
        *Example 1 - Using virtualenvwrapper*
		
		```
       $ source /usr/local/bin/virutalenvwrapper.sh
       $ mkvirtualenv eums
       ```
        
        *Example 2 - Using virtualenv within project directory*
       
       ```
       $ virtualenv eums
       $ source eums/bin/activate
       ``` 
       
	* Install necessary packages
		
		```
		$ pip install -r requirements.txt
		$ cd eums/client
		$ npm install
		$ npm install -g bower
		$ bower install
		$ npm install -g grunt-cli
		```  
		
* Populate the database.

        $ cd to/the/project/root
        $ python manage.py syncdb --noinput
        $ python manage.py migrate
        
* Load seed data

	```
	$ python manage.py loaddata [fixture-file-name]
	```

	**Note:** In order to load seed data there are two fixture files available: `sample-data.json` and `new-deployment-instance.json`:

	* The `sample-data.json` contains example responses, distribution plans, sales orders etc.
	* The `new-deployment-instance.json` is recommended for a clean instance where plans, sales orders, purchase orders, responses are not loaded but tables such as flow, items, item units are filled in. Load the data by running the command line below with the appropriate fixture file name.
	* If running with the `sample-data.json` file, you will need to comment out the `schedule_run_for(line_item)` line in the `eums/signals/handlers.py` file.)


* Run the tests to verify setup. 

	```
	$ python manage.py test
	$ cd eums/client
	$ grunt
	```        
	
	If your virtual environment is not at `~/.virtualenvs/` you should run:

	```
	$ grunt --venvHome=relative/path/to/virtualenv/
	```
        
	**Note:** Grunt Karma:Unit tests run on port 8080. If you need these to run on a different port adjust the port value on eums/eums/client/test/karma.conf.js accordingly.

* Start the redis server
        
        $ brew install redis
        $ redis-server

* Start the application server

        $ cd to/the/project/root
        $ python manage.py runserver
        


Troubleshooting
----------------

* Feature tests run on port 9000. If you're having issues running the feature tests, make sure there is no other process using this port

* When installing packages, we have seen node packages throw a `CERT_UNTRUSTED` error at times. This is due to a [strict SSL issue](http://bower.io/docs/config/#strict-ssl). In this case, you can add a `.bowerrc` file in the `eums/client` directory with the following contents:
	
	```
		{
			"directory": "bower_components",
			"registry": "http://bower.herokuapp.com",
			"strict-ssl": false
			}
	```
	
* At times, `npm` is unable to set the PhantomJS binary to the correct path, even when installing globally. In this case, set it explicitly.

* Also note that the karma server and PhantomJS will both run on port `8080`. Make sure this port is free when running `grunt`.


Deployments
------------

For deployments, see the [Deployment Guide](https://github.com/unicefuganda/eums/wiki/Deployment-Guide).
