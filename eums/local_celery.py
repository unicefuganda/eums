from __future__ import absolute_import
import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eums.settings')

app = Celery('eums', broker='redis://localhost:6379/0', backend='redis://', include=['eums.services.flow_scheduler'])

CELERY_TIMEZONE = 'Africa/Kampala'

app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

if __name__ == '__main__':
    app.start()