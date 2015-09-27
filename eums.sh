#!/bin/sh
set -e

if [ "${1}" = 'manage.py' ]; then
  exec python "${@}"
fi

if [ "${1}" = "celery" ]; then
  exec celery worker -A eums --uid=worker --loglevel=INFO --broker=redis://redis/0
fi

if [ "${1}" = 'uwsgi' ]; then
  sleep 5
  python manage.py migrate
  python manage.py setup_permissions

  exec /usr/local/bin/uwsgi --emperor /etc/uwsgi/sites --env DJANGO_SETTINGS_MODULE=eums.settings --uid worker --gid worker
fi

exec "${@}"
