#!/usr/bin/env bash
# source ~/.virtualenvs/eums/bin/activate
cd /eums
RAPIDPRO_API_TOKEN=b7aec884334247efd48d87f1498f6d35e1519224 celery worker -A eums --uid=worker --loglevel=INFO --broker=redis://redis/0
