from __future__ import absolute_import
import datetime

from django.conf import settings

from eums.celery import app
from eums.models import NodeRun
from eums.rapid_pro.rapid_pro_facade import start_delivery_run


def schedule_run_for(node):
    current_run = node.current_node_run()
    if current_run:
        __cancel_run(current_run)

    if len(node.distributionplanlineitem_set.all()):
        task = _schedule_run.apply_async(args=[node], countdown=__calculate_delay(node))
        NodeRun.objects.create(scheduled_message_task_id=task.id, node=node)


@app.task
def _schedule_run(node):
    line_item = node.distributionplanlineitem_set.all()[0]
    start_delivery_run(
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


def __cancel_run(run):
    app.control.revoke(run.scheduled_message_task_id)