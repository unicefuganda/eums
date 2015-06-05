#!/bin/bash

set -e

pip install -r requirements.txt
pip install python-coveralls
dropdb --if-exists app_test
createdb app_test
python manage.py migrate --settings=eums.snap_settings
echo repo_token: $COVERALLS_REPO_TOKEN >> .coveralls.yml
coverage run --source=eums ./manage.py test --settings=eums.snap_settings -v 2
coveralls
