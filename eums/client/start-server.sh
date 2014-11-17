#!/bin/sh
echo "changing directory"
cd ../../
echo "sourcing virtualenv"
source ~/virtualenvs/eums/bin/activate
echo "create test database"
createdb $2
echo "database migrations"
python manage.py migrate --settings=$1
echo "create user data"
python manage.py loaddata eums/client/test/functional/fixtures/user.json --settings=$1
echo "Going to run the django server using settings " $1
python manage.py runserver 0.0.0.0:8000 --settings=$1