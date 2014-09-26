from __future__ import absolute_import
import datetime

from eums.celery import app
from eums.rapid_pro.rapid_pro_facade import start_delivery_flow
from django.conf import settings


def schedule_flows_for(node):
    task_id = node.scheduled_message_task_id
    if task_id:
        __cancel_flow(task_id)

    if len(node.distributionplanlineitem_set.all()):
        task = _schedule_flow.apply_async(args=[node], countdown=__calculate_delay(node))
        node.scheduled_message_task_id = task.id
        node.save()


@app.task
def _schedule_flow(node):
    line_item = node.distributionplanlineitem_set.all()[0]
    start_delivery_flow(
        sender=__get_sender_name(node),
        item_description=line_item.item.description,
        consignee=node.consignee.build_contact()
    )


def __get_sender_name(node):
    if not node.parent:
        return "UNICEF"
    else:
        return node.parent.consignee.name


def __calculate_delay(node):
    line_item = node.distributionplanlineitem_set.all()[0]
    expected_delivery_date = datetime.datetime.combine(line_item.planned_distribution_date,
                                                       datetime.datetime.min.time())
    when_to_send_message = expected_delivery_date + datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
    return (when_to_send_message - datetime.datetime.now()).total_seconds()


def __cancel_flow(task_id):
    app.control.revoke(task_id)