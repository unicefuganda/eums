#!/bin/sh

python manage.py migrate
python manage.py setup_permissions

/usr/local/bin/uwsgi --emperor /etc/uwsgi/sites --env DJANGO_SETTINGS_MODULE=eums.settings --uid worker --gid worker
