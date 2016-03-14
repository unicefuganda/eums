from django.db import models
from djorm_pgarray.fields import IntegerArrayField
from eums.models import Runnable, Option


class Flow(models.Model):
    class Label(object):
        IMPLEMENTING_PARTNER = 'IMPLEMENTING_PARTNER'
        WEB = 'WEB'
        MIDDLE_MAN = 'MIDDLE_MAN'
        END_USER = 'END_USER'

    NO_OPTION = -1

    temp_end_nodes = IntegerArrayField(dimension=2, null=True)
    optional_end_nodes = IntegerArrayField(dimension=2, null=True)
    final_end_nodes = IntegerArrayField(dimension=2, null=True)

    label = models.CharField(max_length=255,
                             choices=((Label.END_USER, 'End User'), (Label.MIDDLE_MAN, 'Middleman'),
                                      (Label.IMPLEMENTING_PARTNER, 'Implementing Partner'),
                                      (Label.WEB, 'Web')), unique=True)

    def is_temp_ended(self, answer):
        return_value = self.temp_end_nodes and self._get_rapid_pro_end_node(answer) in self.temp_end_nodes
        return return_value

    def is_final_ended(self, answer):
        return_value = self.final_end_nodes and self._get_rapid_pro_end_node(answer) in self.final_end_nodes
        return return_value

    def is_optional_ended(self, answer):
        return_value = self.optional_end_nodes and self._get_rapid_pro_end_node(answer) in self.optional_end_nodes
        return return_value

    def _get_rapid_pro_end_node(self, answer):
        question_id = answer.question.id
        value_id = answer.value.id if type(answer.value) is Option else self.NO_OPTION
        return [question_id, value_id]

    def __unicode__(self):
        return '%s' % str(self.label)

    def question_with(self, **kwargs):
        question = self.questions.filter(**kwargs).first()
        return question.get_subclass_instance()
