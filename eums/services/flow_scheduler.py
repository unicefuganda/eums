from __future__ import absolute_import
import datetime

from celery.schedules import crontab
from celery.task import periodic_task
from django.conf import settings

from eums.celery import app
from eums.models import Run, RunQueue, Flow, Runnable, DistributionPlanNode, DistributionPlan
from eums.rapid_pro.rapid_pro_facade import start_delivery_run
from eums.services.delivery_run_message import DeliveryRunMessage


def schedule_run_for(runnable):
    current_run = runnable.current_run()
    run_delay = _calculate_delay(runnable)
    if current_run:
        _cancel_run(current_run)

    if Run.has_scheduled_run(runnable.contact_person_id):
        RunQueue.enqueue(runnable, run_delay)
    else:
        contact = runnable.build_contact()
        task = _schedule_run.apply_async(args=[runnable.id], countdown=run_delay)
        Run.objects.create(scheduled_message_task_id=task.id, runnable=runnable,
                           status=Run.STATUS.scheduled, phone=contact['phone'])


@app.task
def _schedule_run(runnable_id):
    runnable = Runnable.objects.get(id=runnable_id)
    flow = _flow_for(runnable)
    message = DeliveryRunMessage(runnable)
    start_delivery_run(
        sender=message.sender_name(),
        item_description=message.description(),
        contact_person=runnable.build_contact(),
        flow=flow.rapid_pro_id
    )


def _calculate_delay(runnable):
    expected_delivery_date = datetime.datetime.combine(runnable.delivery_date,
                                                       datetime.datetime.min.time())
    when_to_send_message = expected_delivery_date + datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
    return (when_to_send_message - datetime.datetime.now()).total_seconds() + settings.DELIVERY_BUFFER_IN_SECONDS


def _flow_for(runnable):
    if isinstance(runnable, DistributionPlanNode):
        if runnable.tree_position == Runnable.END_USER:
            return Flow.objects.get(for_runnable_type=Runnable.END_USER)
        return Flow.objects.get(for_runnable_type=Runnable.MIDDLE_MAN)
    elif isinstance(runnable, DistributionPlan):
        return Flow.objects.get(for_runnable_type=Runnable.IMPLEMENTING_PARTNER)


def _cancel_run(run):
    app.control.revoke(run.scheduled_message_task_id)
    run.status = Run.STATUS.cancelled
    run.save()


@periodic_task(run_every=crontab(minute=0, hour=0))
def expire_overdue_runs():
    overdue_runs = Run.overdue_runs()
    for overdue_run in overdue_runs:
        overdue_run.status = Run.STATUS.expired
        overdue_run.save()
        next_run = RunQueue.dequeue(overdue_run.runnable.contact_person_id)
        if next_run:
            schedule_run_for(next_run.runnable)
            next_run.status = RunQueue.STATUS.started
            next_run.save()
