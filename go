#!/usr/bin/env bash
set -e

function main {
  case "$1" in

    "prep" )
      if [ "$2" = "--back" ]; then
        prepbackend
      elif [ "$2" = "--front" ]; then
        prepfrontend
      else
        prepbackend
        prepfrontend
      fi;;

    "build" )
      build;;

    "resetdb" )
      if [ "$2" = "--test" ]; then
        killtestdbconnections
        resetdb test
      else
        killdbconnections
        resetdb
      fi;;

    "seed" )
      seed;;

    "bt" )
      testbackend;;

    "ut" )
      testjsunit;;

    "ft" )
      if [ "$2" = "--headless" ]; then
        testfunctional --headless
      elif [ "$2" = "--nomigrations" ]; then
         testfunctional --nomigrations
      else
        testfunctional
      fi;;

    "fft" )
      testfunctional --multi;;

    "at" )
      testbackend
      testjsunit
      testfunctional;;

    "rs" )
      runserver;;

    "rdf" )
      redepolyfrontend;;

    "prepush" )
       testbackend
       testjsunit;;

    "performance" )
      performance $2;;

    "setupmap" )
      setupmap $2 $3;;

    esac
}

function build {
  cd eums/client
  grunt build
  cd -
}

function prepbackend {
  if [ ! -d ~/.virtualenvs/eums ]; then
    virtualenv ~/.virtualenvs/eums
  fi
  source ~/.virtualenvs/eums/bin/activate
  pip install -r requirements.txt
  killtestdbconnections
  echo "drop database eums_test; create database eums_test;" | psql -h localhost -U postgres
  echo "******* make migrations ********"
  python manage.py makemigrations && python manage.py migrate
}

function prepfrontend {
  cd eums/client
  sudo npm install -g grunt-cli
  npm install
  sudo npm install -g bower
  echo n | bower install
  cd -
}

function resetdb {
  if [ "$1" = "test" ]; then
    echo "+++ Resetting database eums_test..."
    echo "drop database eums_test; create database eums_test;" | psql -h localhost -U postgres
    python manage.py migrate --settings=eums.test_settings
    python manage.py setup_permissions --settings=eums.test_settings
    python manage.py shell_plus < eums/fixtures/load_flows_and_questions.py
    python manage.py loaddata eums/client/test/functional/fixtures/user.json --settings=eums.test_settings
  else
    echo "+++ Resetting database eums..."
    echo "drop database eums; create database eums;" | psql -h localhost -U postgres
    python manage.py migrate
    python manage.py setup_permissions
    python manage.py shell_plus < eums/fixtures/load_flows_and_questions.py
    python manage.py shell_plus < eums/fixtures/init_basic_data.py
    python manage.py loaddata eums/client/test/functional/fixtures/user.json
  fi
}

function testbackend {
  source ~/.virtualenvs/eums/bin/activate
  pip install -r requirements.txt
  python manage.py test -v 2 --noinput
}

function testjsunit {
  cd eums/client
  grunt unit
  cd -
}

function performance {
  cd eums/client
  if [ "$1" ]; then
    echo "Measuring load time for EUMS at $1..."
    grunt performance --baseUrl=$1
  else
    echo "Measuring load time for EUMS at http://localhost"
    grunt performance --baseUrl=http://localhost
  fi
  cd scripts
  ant
}

function testfunctional {
  killtestdbconnections
  if [ $(lsof -t -i :9000) ]; then kill -9 $(lsof -t -i :9000); fi
  cd eums/client
  source ~/.virtualenvs/eums/bin/activate

  if [ "$1" = "--headless" ]; then
    grunt prep-test-env
    python ../../manage.py runserver 9000 --settings=eums.test_settings &> /dev/null &
    grunt functional-headless
  elif [ "$1" = "--nomigrations" ]; then
    grunt functional-nomigrations
  elif [ "$1" = "--multi" ]; then
    grunt functional --multi
  else
    grunt functional
  fi

  cd -
}

function killdbconnections {
  echo "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'eums' AND pid <> pg_backend_pid();" | psql -U postgres &> /dev/null
}

function killtestdbconnections {
  echo "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'eums_test' AND pid <> pg_backend_pid();" | psql -U postgres &> /dev/null
}


function redepolyfrontend {
  cd eums/client
  grunt build

}

function runserver {
  cd eums/client
  npm install
  bower install
  grunt build
  cd -
  pip install -r requirements.txt
  ./manage.py migrate
  ./manage.py setup_permissions
  ./manage.py runserver
}

function seed {
  python manage.py loaddata eums/fixtures/sample-data.json
}

function setupmap {
  cd ./scripts/setupmap
  . ./setupmap.sh
}


main $@
exit 0
