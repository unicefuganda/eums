from __future__ import absolute_import
from eums.celery import app
from eums.rapid_pro.rapid_pro_facade import start_delivery_flow


def schedule_flows_for(node):
    # return _schedule_flow.apply_async(args=[node], countdown=node.distribution_plan.date + 7)
    _schedule_flow.apply_async(args=[node], countdown=7)


@app.task
def _schedule_flow(node):
    # start_delivery_flow(item=node.distributionplanlineitem_set, name=node.consignee.name,
    # phone=node.consignee.contact_person_id)
    start_delivery_flow()