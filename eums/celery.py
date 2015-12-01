from __future__ import absolute_import
import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eums.staging_settings')

app = Celery('eums', broker='redis://localhost:6379/0', backend='redis://',
             include=['eums.services.flow_scheduler', 'eums.services.csv_export_service',
                      'csv_clear_service', 'eums.elasticsearch.synchroniser'])

CELERY_TIMEZONE = 'Africa/Kampala'

app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

if __name__ == '__main__':
    app.start()
