import datetime

from django.conf import settings

from eums.models import RunQueue


def update_exist_runqueue_start_time():
    existed_tasks = RunQueue.objects.filter(status=RunQueue.STATUS.not_started, start_time=None)
    if existed_tasks:
        for existed_task in existed_tasks:
            when_to_send_message = existed_task.runnable.delivery_date \
                                   + datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
            existed_task.start_time = when_to_send_message
            existed_task.save()


update_exist_runqueue_start_time()
