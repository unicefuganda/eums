#!/bin/sh
set -e

if [ "${1}" = 'manage.py' ]; then
  exec python "${@}"
fi

if [ "${1}" = 'uwsgi' ]; then
  python manage.py migrate
  python manage.py setup_permissions

  exec /usr/local/bin/uwsgi --emperor /etc/uwsgi/sites --env DJANGO_SETTINGS_MODULE=eums.settings --uid worker --gid worker
fi
