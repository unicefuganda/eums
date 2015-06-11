#!/bin/sh
echo "changing directory"
cd ../../
echo "Going to run the Django server on port" $1 "using settings " $2
python manage.py runserver 0.0.0.0:$1 --settings=$2
