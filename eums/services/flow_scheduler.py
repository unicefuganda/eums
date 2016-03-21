from __future__ import absolute_import

import datetime
import logging

from celery.schedules import crontab
from celery.task import periodic_task
from django.conf import settings
from django.db.models import Q

from eums.celery import app
from eums.models import Run, RunQueue, Runnable, DistributionPlan, DistributionPlanNode, Flow
from eums.models.alert import Alert
from eums.rapid_pro.rapid_pro_service import rapid_pro_service
from eums.services.delivery_run_message import DeliveryRunMessage

logger = logging.getLogger(__name__)
HOUR_TO_SEND_SMS = 9


def schedule_run_for(runnable, run_delay=0):
    if _should_schedule(runnable):
        _cancel_current_run(runnable)
        delay = _calculate_delay(runnable, run_delay)
        schedule_run_directly_for(runnable, delay)


def schedule_run_directly_for(runnable, run_delay):
    if Run.has_scheduled_run(runnable.contact_person_id):
        RunQueue.enqueue(runnable, settings.DELIVERY_STATUS_CHECK_DELAY)
    elif settings.RAPIDPRO_LIVE:
        task = _schedule_run.apply_async(args=[runnable.id], countdown=run_delay)
        Run.objects.create(scheduled_message_task_id=task.id, runnable=runnable,
                           status=Run.STATUS.scheduled, phone=runnable.contact.phone)


def _should_schedule(runnable):
    return runnable.completed_run() is None


@app.task
def _schedule_run(runnable_id):
    runnable = Runnable.objects.get(id=runnable_id)
    message = DeliveryRunMessage(runnable)
    rapid_pro_service.create_run(runnable.build_contact(), runnable.flow(),
                                 message.description(), message.sender_name())


def _calculate_delay(runnable, run_delay):
    expected_delivery_date = datetime.datetime.combine(runnable.delivery_date, datetime.datetime.min.time())
    when_to_send_message = expected_delivery_date \
        + datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY, hours=HOUR_TO_SEND_SMS)

    delay_in_seconds = (when_to_send_message - datetime.datetime.now()).total_seconds()

    delay = run_delay if run_delay > 0 else settings.DELIVERY_BUFFER_IN_SECONDS
    return delay_in_seconds if delay_in_seconds > 0 else delay


def _cancel_current_run(runnable):
    current_run = runnable.current_run()
    if current_run:
        _cancel(current_run)


def _cancel(run):
    if settings.CELERY_LIVE:
        app.control.revoke(run.scheduled_message_task_id)
    run.update_status(Run.STATUS.cancelled)


@periodic_task(run_every=crontab(minute=0, hour=HOUR_TO_SEND_SMS))
def expire_overdue_runs():
    overdue_runs = Run.overdue_runs()
    for overdue_run in overdue_runs:
        overdue_run.update_status(Run.STATUS.expired)
        next_run = RunQueue.dequeue(overdue_run.runnable.contact_person_id)
        if next_run:
            schedule_run_for(next_run.runnable)
            next_run.update_status(RunQueue.STATUS.started)


@periodic_task(run_every=crontab(minute=0, hour=0))
def distribution_alert_raise():
    distribution_plans = DistributionPlan.objects.all()
    for distribution_plan in distribution_plans:
        runnable = Runnable.objects.get(id=distribution_plan.runnable_ptr_id)
        if is_distribution_expired_alert_not_raised(runnable) \
                and is_shipment_received_but_not_distributed(distribution_plan) \
                and is_distribution_expired(distribution_plan):
            logger.info('Raise alert')
            runnable.create_alert(Alert.ISSUE_TYPES.distribution_expired)


def is_distribution_expired_alert_not_raised(runnable):
    logger.info('is_distribution_expired_alert_not_raised:' + str(
        not Alert.objects.filter(issue=Alert.ISSUE_TYPES.distribution_expired,
                                 runnable=runnable)))
    return not Alert.objects.filter(issue=Alert.ISSUE_TYPES.distribution_expired,
                                    runnable=runnable)


def is_shipment_received_but_not_distributed(distribution_plan):
    runnable_id = distribution_plan.runnable_ptr_id
    not_distributed = DistributionPlanNode.objects.filter(Q(distribution_plan_id=runnable_id) & (
        Q(tree_position=Flow.Label.MIDDLE_MAN) | Q(tree_position=Flow.Label.END_USER))).count() == 0
    logger.info(
        'is_shipment_received_but_not_distributed:' + str(
            distribution_plan.shipment_received() and not_distributed))
    return distribution_plan.shipment_received() and not_distributed


def is_distribution_expired(distribution_plan):
    time_limitation = distribution_plan.time_limitation_on_distribution
    date_received_str = distribution_plan.received_date()
    if time_limitation and date_received_str:
        date_received = datetime.datetime.strptime(date_received_str.split('T')[0], '%Y-%m-%d').date()
        logger.info(
            'is_distribution_expired:' + str((datetime.date.today() - date_received).days - 2 > time_limitation))
        if (datetime.date.today() - date_received).days - 2 >= time_limitation:
            return True
    return False
