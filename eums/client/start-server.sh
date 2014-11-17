#!/bin/sh
echo "changing directory"
cd ../../
echo "Going to run the django server using settings " $1
python manage.py runserver 0.0.0.0:8000 --settings=$1