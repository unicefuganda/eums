from __future__ import absolute_import
import os
from celery import Celery
from celery.utils.log import get_task_logger
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eums.settings_production')

logger = get_task_logger(__name__)

app = Celery('eums', broker='redis://localhost:6379/0', backend='redis://',
             include=['eums.services.flow_scheduler', 'eums.services.csv_export_service',
                      'eums.services.csv_clear_service', 'eums.elasticsearch.synchroniser',
                      'eums.services.contact_service', 'eums.vision.sync_runner', 'eums.signals.handlers'])

CELERY_TIMEZONE = settings.TIME_ZONE

app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

if __name__ == '__main__':
    app.start()
