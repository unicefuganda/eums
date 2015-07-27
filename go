#!/usr/bin/env bash
set -e

function main {
  case "$1" in

    "prep" )
      prep;;

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
      else
        testfunctional
      fi;;

    "at" )
      testbackend
      testjsunit
      testfunctional;;

    "rs" )
      runserver;;

    esac
}

function build {
  cd eums/client
  grunt build
  cd -
}

function prep {
  if [ ! -d ~/.virtualenvs/eums ]; then
    virtualenv ~/.virtualenvs/eums
  fi
  source ~/.virtualenvs/eums/bin/activate
  pip install -r requirements.txt
  sudo npm install -g grunt-cli
  cd eums/client
  npm install
  sudo npm install -g bower
  echo n | bower install
  echo "drop database eums_test; create database eums_test;" | psql -h localhost -U postgres
}

function resetdb {
  if [ "$1" = "test" ]; then
    echo "+++ Resetting database eums_test..."
    echo "drop database eums_test; create database eums_test;" | psql -h localhost -U postgres
    python manage.py migrate --settings=eums.test_settings
    python manage.py loaddata eums/client/test/functional/fixtures/user.json --settings=eums.test_settings
  else
    echo "+++ Resetting database eums..."
    echo "drop database eums; create database eums;" | psql -h localhost -U postgres
    python manage.py migrate
    python manage.py loaddata eums/client/test/functional/fixtures/user.json
  fi
}

function testbackend {
  source ~/.virtualenvs/eums/bin/activate
  python manage.py migrate --settings=eums.test_settings
  python manage.py test -v 2 --settings=eums.test_settings
}

function testjsunit {
  cd eums/client
  grunt unit
  cd -
}

function testfunctional {
  killtestdbconnections
  if [ $(lsof -t -i :9000) ]; then kill -9 $(lsof -t -i :9000); fi
  cd eums/client
  source ~/.virtualenvs/eums/bin/activate

  if [ "$1" = "--headless" ]; then
    grunt prep-test-env
    python ../../manage.py runserver 9000 --settings=eums.test_settings &> /dev/null &
    grunt protractor:headless
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
  python manage.py loaddata eums/client/test/functional/fixtures/mapdata.json
}

main $@
exit 0
