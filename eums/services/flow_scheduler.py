from __future__ import absolute_import
import datetime

from django.conf import settings

from eums.celery import app
from eums.models import NodeLineItemRun, DistributionPlanLineItem, RunQueue, DistributionPlanNode
from eums.rapid_pro.rapid_pro_facade import start_delivery_run


def schedule_run_for(node_line_item):
    current_run = node_line_item.current_run()
    if current_run:
        __cancel_run(current_run)

    run_delay = __calculate_delay(node_line_item)
    consignee = node_line_item.distribution_plan_node.consignee
    if NodeLineItemRun.current_run_for_consignee(consignee.id):
        RunQueue.enqueue(node_line_item, run_delay)
    else:
        contact = consignee.build_contact()
        task = _schedule_run.apply_async(args=[node_line_item.id], countdown=run_delay)
        NodeLineItemRun.objects.create(scheduled_message_task_id=task.id, node_line_item=node_line_item,
                                       status=NodeLineItemRun.STATUS.scheduled, phone=contact['phone'],
                                       consignee=consignee)


@app.task
def _schedule_run(node_line_item_id):
    node_line_item = DistributionPlanLineItem.objects.get(id=node_line_item_id)
    node = node_line_item.distribution_plan_node
    flow = __select_flow_for(node)
    start_delivery_run(
        sender=__get_sender_name(node),
        item_description=node_line_item.item.description,
        consignee=node.consignee.build_contact(),
        flow=flow
    )


def __select_flow_for(node):
    if node.tree_position is DistributionPlanNode.END_USER:
        return settings.RAPIDPRO_FLOWS['END_USER']
    return settings.RAPIDPRO_FLOWS['MIDDLE_MAN']


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
    run.status = NodeLineItemRun.STATUS.cancelled
    run.save()