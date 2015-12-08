from django.db import models


class SystemSettings(models.Model):
    auto_track = models.BooleanField(default=False)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return 'System deliveries are %s tracked automatically.' % '' if self.auto_track else 'not'
