from django.db import models
from django.db.models import Q

from eums.models import MultipleChoiceAnswer, PurchaseOrderItem, Flow, Question, TextQuestion, TextAnswer, \
    MultipleChoiceQuestion
from eums.models import Runnable, DistributionPlanNode
from eums.models.programme import Programme


class DistributionPlan(Runnable):
    programme = models.ForeignKey(Programme)
    date = models.DateField(auto_now=True)

    class Meta:
        app_label = 'eums'

    def save(self, *args, **kwargs):
        super(DistributionPlan, self).save(*args, **kwargs)
        DistributionPlanNode.objects.filter(distribution_plan=self).update(track=self.track)

    def total_value(self):
        delivery_root_nodes = DistributionPlanNode.objects.root_nodes_for(delivery=self)
        return reduce(lambda total, node: total + node.item.unit_value() * node.quantity_in(), delivery_root_nodes, 0)

    def __unicode__(self):
        return "%s, %s" % (self.programme.name, str(self.date))

    def is_received(self):
        answer = MultipleChoiceAnswer.objects.filter(Q(run__runnable__id=self.id),
                                                     Q(question__label='deliveryReceived'),
                                                     ~ Q(run__status='cancelled')).first()

        return True if answer and answer.value.text == 'Yes' else False

    def type(self):
        delivery_node = DistributionPlanNode.objects.filter(distribution_plan=self).first()

        if delivery_node:
            return 'Purchase Order' if isinstance(delivery_node.item, PurchaseOrderItem) else 'Waybill'
        return 'Unknown'

    def number(self):
        delivery_node = DistributionPlanNode.objects.filter(distribution_plan=self).first()
        return delivery_node.item.number() if delivery_node and delivery_node.item else 'Unknown'

    def number_of_items(self):
        return DistributionPlanNode.objects.filter(distribution_plan=self).count()

    def answers(self):
        ip_flow = Flow.objects.get(for_runnable_type='IMPLEMENTING_PARTNER')
        text_questions = TextQuestion.objects.filter(flow=ip_flow)
        multiple_choice_questions = MultipleChoiceQuestion.objects.filter(flow=ip_flow)

        text_answers = self._build_text_answers(text_questions)
        multiple_choice_answers = self._build_multiple_choice_answers(multiple_choice_questions)

        return text_answers + multiple_choice_answers

    def _build_multiple_choice_answers(self, multiple_choice_questions):
        answers = []
        for question in multiple_choice_questions:
            answer = MultipleChoiceAnswer.objects.filter(run__runnable_id=self.id, question=question)
            options = DistributionPlan._build_options(question)
            answers.append(
                {
                    'questionLabel': question.label,
                    'type': 'multipleChoice',
                    'text': question.text,
                    'value': answer.first().value.text if answer else '',
                    'options': options
                }
            )
        return answers

    def _build_text_answers(self, text_questions):
        answers = []
        for question in text_questions:
            answer = TextAnswer.objects.filter(run__runnable_id=self.id, question=question)
            answers.append(
                {
                    'questionLabel': question.label,
                    'type': 'text',
                    'text': question.text,
                    'value': answer.first().value if answer else "",
                }
            )
        return answers

    @staticmethod
    def _build_options(question):
        options = []
        for option in question.option_set.all():
            options.append(option.text) if option.text != 'UNCATEGORISED' else None
        return options
