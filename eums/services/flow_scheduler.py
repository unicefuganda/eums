from __future__ import absolute_import
from eums.celery import app
from eums.rapid_pro.rapid_pro_facade import start_delivery_flow


def schedule_flows_for(node):
    return _schedule_flow.apply_async(10, countdown=3)


@app.task
def _schedule_flow(n):
    return start_delivery_flow({})