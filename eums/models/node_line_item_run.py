from django.db import models
from django.db.models import Q
from model_utils.fields import StatusField
from model_utils import Choices

from eums.models import DistributionPlanLineItem, Consignee


class NodeLineItemRun(models.Model):
    STATUS = Choices('scheduled', 'completed', 'expired', 'cancelled')
    scheduled_message_task_id = models.CharField(max_length=255)
    node_line_item = models.ForeignKey(DistributionPlanLineItem)
    status = StatusField()
    consignee = models.ForeignKey(Consignee)
    phone = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'

    @classmethod
    def current_run_for_consignee(cls, consignee_id):
        line_item_runs = NodeLineItemRun.objects.filter(
            Q(node_line_item__distribution_plan_node__consignee_id=consignee_id) &
            Q(status=NodeLineItemRun.STATUS.scheduled))
        if len(line_item_runs):
            return line_item_runs[0]
        return None

