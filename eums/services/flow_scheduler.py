from __future__ import absolute_import
import datetime

from django.conf import settings

from eums.celery import app
from eums.models import NodeLineItemRun, DistributionPlanLineItem
from eums.rapid_pro.rapid_pro_facade import start_delivery_run


def schedule_run_for(node_line_item):
    current_run = node_line_item.current_node_line_item_run()
    if current_run:
        __cancel_run(current_run)

    task = _schedule_run.apply_async(args=[node_line_item.id], countdown=__calculate_delay(node_line_item))
    NodeLineItemRun.objects.create(scheduled_message_task_id=task.id, node_line_item=node_line_item)


@app.task
def _schedule_run(node_line_item_id):
    node_line_item = DistributionPlanLineItem.objects.get(id=node_line_item_id)
    node = node_line_item.distribution_plan_node
    start_delivery_run(
        sender=__get_sender_name(node),
        item_description=node_line_item.item.description,
        consignee=node.consignee.build_contact()
    )


def __get_sender_name(node):
    if not node.parent:
        return "UNICEF"
    else:
        return node.parent.consignee.name


def __calculate_delay(node_line_item):
    expected_delivery_date = datetime.datetime.combine(node_line_item.planned_distribution_date,
                                                       datetime.datetime.min.time())
    when_to_send_message = expected_delivery_date + datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
    return (when_to_send_message - datetime.datetime.now()).total_seconds()


def __cancel_run(run):
    app.control.revoke(run.scheduled_message_task_id)