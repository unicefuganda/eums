#!/usr/bin/env bash
source ~/.virtualenvs/eums/bin/activate
cd /opt/app/eums
celery worker -A eums -B --loglevel=INFO