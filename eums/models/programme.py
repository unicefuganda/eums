from django.db import models


class Programme(models.Model):
    name = models.CharField(max_length=255)
    wbs_element_ex = models.CharField(max_length=255, unique=False)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return '%s' % self.name
