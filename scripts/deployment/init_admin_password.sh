#!/bin/bash

python manage.py runscript eums.fixtures.create_or_update_superuser_password --script-args="username=admin,password=${ADMIN_PASSWORD}"
