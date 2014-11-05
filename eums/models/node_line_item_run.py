import datetime

from django.db import models
from django.db.models import Q
from model_utils.fields import StatusField
from model_utils import Choices

from eums import settings
from eums.models import DistributionPlanLineItem


class NodeLineItemRun(models.Model):
    STATUS = Choices('scheduled', 'completed', 'expired', 'cancelled')
    scheduled_message_task_id = models.CharField(max_length=255)
    node_line_item = models.ForeignKey(DistributionPlanLineItem)
    status = StatusField()
    phone = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'

    def answers(self):
        numeric_answers = self.numericanswer_set.all()
        text_answers = self.textanswer_set.all()
        multiple_choice_answers = self.multiplechoiceanswer_set.all()
        return list(numeric_answers) + list(text_answers) + list(multiple_choice_answers)

    def __unicode__(self):
        return "Item: %s - Node - %s - Phone: %s Status %s" % (self.node_line_item.item.description,
                                                               self.node_line_item.distribution_plan_node.tree_position,
                                                               self.phone, self.status)

    @classmethod
    def current_run_for_node(cls, node):
        return NodeLineItemRun.objects.filter(
            Q(node_line_item__distribution_plan_node=node) &
            Q(status=NodeLineItemRun.STATUS.scheduled)).first()

    @classmethod
    def overdue_runs(cls):
        delivery_status_check_delay = datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
        max_allowed_reply_period = datetime.timedelta(days=settings.MAX_ALLOWED_REPLY_PERIOD)

        today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
        latest_allowed_date = today - delivery_status_check_delay - max_allowed_reply_period

        return NodeLineItemRun.objects.filter(Q(status=NodeLineItemRun.STATUS.scheduled) &
                                              Q(node_line_item__planned_distribution_date__lt=latest_allowed_date))