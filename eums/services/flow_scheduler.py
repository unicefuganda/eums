from __future__ import absolute_import
import datetime

from celery.schedules import crontab
from celery.task import periodic_task
from django.conf import settings

from eums.celery import app
from eums.models import Run, RunQueue, Runnable
from eums.rapid_pro.rapid_pro_facade import start_delivery_run
from eums.services.delivery_run_message import DeliveryRunMessage


def schedule_run_for(runnable):
    if _should_schedule(runnable):
        _cancel_current_run(runnable)
        run_delay = _calculate_delay(runnable)

        if Run.has_scheduled_run(runnable.contact_person_id):
            RunQueue.enqueue(runnable, run_delay)
        elif settings.RAPIDPRO_LIVE:
            task = _schedule_run.apply_async(args=[runnable.id], countdown=run_delay)
            Run.objects.create(scheduled_message_task_id=task.id, runnable=runnable,
                               status=Run.STATUS.scheduled, phone=runnable.contact.phone)


def _should_schedule(runnable):
    return runnable.completed_run() is None or runnable.is_retriggered


@app.task
def _schedule_run(runnable_id):
    runnable = Runnable.objects.get(id=runnable_id)
    flow = runnable.flow()
    message = DeliveryRunMessage(runnable)
    start_delivery_run(
        sender=message.sender_name(),
        item_description=message.description(),
        contact_person=runnable.build_contact(),
        flow=flow.rapid_pro_id
    )


def _calculate_delay(runnable):
    if runnable.is_retriggered:
        return 0

    expected_delivery_date = datetime.datetime.combine(runnable.delivery_date,
                                                       datetime.datetime.min.time())
    when_to_send_message = expected_delivery_date + datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
    delay_in_seconds = (when_to_send_message - datetime.datetime.now()).total_seconds()
    return delay_in_seconds if delay_in_seconds > 0 else settings.DELIVERY_BUFFER_IN_SECONDS


def _cancel_current_run(runnable):
    current_run = runnable.current_run()
    if current_run:
        _cancel(current_run)


def _cancel(run):
    app.control.revoke(run.scheduled_message_task_id)
    run.update_status(Run.STATUS.cancelled)


@periodic_task(run_every=crontab(minute=0, hour=0))
def expire_overdue_runs():
    overdue_runs = Run.overdue_runs()
    for overdue_run in overdue_runs:
        overdue_run.update_status(Run.STATUS.expired)
        next_run = RunQueue.dequeue(overdue_run.runnable.contact_person_id)
        if next_run:
            schedule_run_for(next_run.runnable)
            next_run.update_status(RunQueue.STATUS.started)





