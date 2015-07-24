import datetime

from django.db import models
from django.db.models import Q
from model_utils.fields import StatusField
from model_utils import Choices

from eums import settings
from eums.models import DistributionPlanNode


class NodeRun(models.Model):
    STATUS = Choices('scheduled', 'completed', 'expired', 'cancelled')
    scheduled_message_task_id = models.CharField(max_length=255)
    node = models.ForeignKey(DistributionPlanNode)
    status = StatusField()
    phone = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'

    def answers(self):
        numeric_answers = self.numericanswer_set.all()
        text_answers = self.textanswer_set.all()
        multiple_choice_answers = self.multiplechoiceanswer_set.all()
        return list(numeric_answers) + list(text_answers) + list(multiple_choice_answers)

    def questions_and_responses(self):
        answers = self.answers()
        return reduce(self._merge, answers, {})

    @staticmethod
    def _merge(answer_collection, answer):
        value = answer.value if type(answer.value) is long else str(answer.value)
        answer_collection[str(answer.question.label)] = value
        return answer_collection

    def __unicode__(self):
        return "Item: %s - Node - %s - Phone: %s Status %s" % (self.node.item.item.description,
                                                               self.node.tree_position,
                                                               self.phone, self.status)

    @classmethod
    def current_run_for_node(cls, node):
        return NodeRun.objects.filter(
            Q(node=node) &
            Q(status=NodeRun.STATUS.scheduled)).first()

    @classmethod
    def overdue_runs(cls):
        delivery_status_check_delay = datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
        max_allowed_reply_period = datetime.timedelta(days=settings.MAX_ALLOWED_REPLY_PERIOD)

        today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
        latest_allowed_date = today - delivery_status_check_delay - max_allowed_reply_period

        return NodeRun.objects.filter(Q(status=NodeRun.STATUS.scheduled) &
                                      Q(node__delivery_date__lt=latest_allowed_date))