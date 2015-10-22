from django.db import models
from eums.models.time_stamped_model import TimeStampedModel


class Programme(TimeStampedModel):
    name = models.CharField(max_length=255)
    wbs_element_ex = models.CharField(max_length=255, unique=True)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return '%s' % self.name

    def to_dict_with_ips(self):
        return {'id': self.id,
                'name': self.name,
                'ips': self.nodes.values_list('ip', flat=True).distinct()}