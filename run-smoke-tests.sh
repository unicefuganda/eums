#!/bin/bash

SETTINGS_MODULE=$1

if [ -z "$SETTINGS_MODULE" ]; then
    ./manage.py test -p smoke*.py
else
    ./manage.py test --settings=${SETTINGS_MODULE} -p smoke*.py
fi