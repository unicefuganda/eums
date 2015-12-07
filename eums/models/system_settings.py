from django.db import models


class SystemSettings(models.Model):
    auto_track = models.BooleanField(default=False)

    def __unicode__(self):
        return 'System deliveries are %s tracked automatically.' % '' if self.auto_track else 'not'
