#!/bin/sh
echo "Going to run the server using settings " $1
ls ../..
PYTHONPATH=../../ python ../../manage.py runserver 0.0.0.0:8000 --settings=$1