from django.db import models


class SystemSettings(models.Model):
    auto_track = models.BooleanField(default=False)
    sync_start_date = models.DateTimeField(null=True)

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return 'SystemSettings = {id : %s, auto_track : %s, sync_start_time : %s}' \
               % (str(self.id), str(self.auto_track), str(self.sync_start_date))
