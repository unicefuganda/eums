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
    # TODO: to be removed
    rapid_pro_id = models.IntegerField()
    end_nodes = IntegerArrayField(dimension=2)
    label = models.CharField(max_length=255,
                             choices=((Label.END_USER, 'End User'), (Label.MIDDLE_MAN, 'Middleman'),
                                      (Label.IMPLEMENTING_PARTNER, 'Implementing Partner'),
                                      (Label.WEB, 'Web')), unique=True)

    def is_end(self, answer):
        question_id = answer.question.id
        value_id = answer.value.id if type(answer.value) is Option else self.NO_OPTION
        return_value = self.end_nodes and [question_id, value_id] in self.end_nodes
        return return_value

    def __unicode__(self):
        return '%s' % str(self.label)

    def question_with(self, **kwargs):
        question = self.questions.filter(**kwargs).first()
        return question.get_subclass_instance()
