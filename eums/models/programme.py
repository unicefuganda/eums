from django.db import models


class Programme(models.Model):
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