#!/bin/sh
echo "Going to run the django server using settings " $1
PYTHONPATH=../../ python ../../manage.py runserver 0.0.0.0:8000 --settings=$1