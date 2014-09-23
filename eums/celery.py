from __future__ import absolute_import
from celery import Celery

app = Celery('eums', broker='redis://', backend='redis://', include=['eums.services.flow_scheduler'])

if __name__ == '__main__':
    app.start()