#!/usr/bin/env bash
source ~/.virtualenvs/eums/bin/activate
cd /opt/app/eums
export RAPIDPRO_API_TOKEN=b7aec884334247efd48d87f1498f6d35e1519224; celery worker -A eums --loglevel=INFO