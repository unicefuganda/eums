from django.db import models


class SystemSettings(models.Model):
    auto_track = models.BooleanField(default=False)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return 'SystemSettings = {id : %s, auto_track : %s}' % (str(self.id), str(self.auto_track))