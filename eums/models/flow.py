from django.db import models
from djorm_pgarray.fields import IntegerArrayField

from eums.models import Runnable, Option


class Flow(models.Model):
    NO_OPTION = -1
    rapid_pro_id = models.IntegerField()
    end_nodes = IntegerArrayField(dimension=2)
    for_runnable_type = models.CharField(
        max_length=255, choices=((Runnable.END_USER, 'End User'), (Runnable.MIDDLE_MAN, 'Middleman'),
                                 (Runnable.IMPLEMENTING_PARTNER, 'Implementing Partner'),
                                 (Runnable.WEB, 'Web')), unique=True)

    def is_end(self, answer):
        question_id = answer.question.id
        value_id = answer.value.id if type(answer.value) is Option else self.NO_OPTION
        return_value = self.end_nodes and [question_id, value_id] in self.end_nodes
        return return_value

    def __unicode__(self):
        return '%s' % str(self.for_runnable_type)
