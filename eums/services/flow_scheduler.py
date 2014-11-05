from __future__ import absolute_import
import datetime

from celery.schedules import crontab
from celery.task import periodic_task
from django.conf import settings

from eums.celery import app
from eums.models import NodeLineItemRun, DistributionPlanLineItem, RunQueue, DistributionPlanNode, Flow
from eums.rapid_pro.rapid_pro_facade import start_delivery_run


def schedule_run_for(node_line_item):
    current_run = node_line_item.current_run()
    if current_run:
        _cancel_run(current_run)

    run_delay = _calculate_delay(node_line_item)
    node = node_line_item.distribution_plan_node
    if NodeLineItemRun.current_run_for_node(node):
        RunQueue.enqueue(node_line_item, run_delay)
    else:
        contact = node.build_contact()
        task = _schedule_run.apply_async(args=[node_line_item.id], countdown=run_delay)
        NodeLineItemRun.objects.create(scheduled_message_task_id=task.id, node_line_item=node_line_item,
                                       status=NodeLineItemRun.STATUS.scheduled, phone=contact['phone'])


@app.task
def _schedule_run(node_line_item_id):
    node_line_item = DistributionPlanLineItem.objects.get(id=node_line_item_id)
    node = node_line_item.distribution_plan_node
    flow = _select_flow_for(node)
    start_delivery_run(
        sender=_get_sender_name(node),
        item_description=node_line_item.item.description,
        contact_person=node.build_contact(),
        flow=flow.rapid_pro_id
    )


def _select_flow_for(node):
    if node.tree_position == DistributionPlanNode.END_USER:
        return Flow.objects.get(for_node_type=DistributionPlanNode.END_USER)
    return Flow.objects.get(for_node_type=DistributionPlanNode.MIDDLE_MAN)


def _get_sender_name(node):
    if not node.parent:
        return "UNICEF"
    else:
        return node.parent.consignee.name


def _calculate_delay(node_line_item):
    expected_delivery_date = datetime.datetime.combine(node_line_item.planned_distribution_date,
                                                       datetime.datetime.min.time())
    when_to_send_message = expected_delivery_date + datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
    return (when_to_send_message - datetime.datetime.now()).total_seconds()


def _cancel_run(run):
    app.control.revoke(run.scheduled_message_task_id)
    run.status = NodeLineItemRun.STATUS.cancelled
    run.save()


@periodic_task(run_every=crontab(minute=0, hour=0))
def expire_overdue_runs():
    overdue_runs = NodeLineItemRun.overdue_runs()
    for overdue_run in overdue_runs:
        overdue_run.status = NodeLineItemRun.STATUS.expired
        overdue_run.save()
        next_run = RunQueue.dequeue(overdue_run.node_line_item.distribution_plan_node.contact_person_id)
        if next_run:
            schedule_run_for(next_run.node_line_item)
            next_run.status = RunQueue.STATUS.started
            next_run.save()
