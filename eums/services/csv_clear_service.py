import csv
import os

import time
from django.conf import settings
from django.core import mail
from eums.celery import app
from eums.settings import BASE_DIR

EXPORTS_DIR = os.path.join(BASE_DIR, 'eums/client/exports')
print EXPORTS_DIR
print isinstance(EXPORTS_DIR, tuple)


class CSVClearService(object):
    EXPORTS_DIR = os.path.join(BASE_DIR, 'eums/client/exports')

    CLEAR_DIRECTORIES = []

    @classmethod
    def generate(cls, data, filename):
        file_location = settings.EXPORTS_DIR + filename
        export_file = open(file_location, 'wb')
        export_file.write('sep=,\n')
        wr = csv.writer(export_file, quoting=csv.QUOTE_ALL)
        wr.writerows(data)

    @classmethod
    def notify(cls, user, subject, message):
        message = message % user.username
        if getattr(user, 'email', None):
            mail.send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


@app.task
def clear_expired_csv():
    for file in os.listdir(EXPORTS_DIR):
        create_time = time.ctime(os.path.getctime(file))

    pass
