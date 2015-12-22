from django.db import models


class SystemSettings(models.Model):
    auto_track = models.BooleanField(default=False)
    sync_start_date = models.DateTimeField(null=True)
    notification_message = models.TextField(max_length=300, default='')

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return 'SystemSettings = {id : %s, auto_track : %s, sync_start_date : %s, notification_message : %s}' \
               % (str(self.id), str(self.auto_track), str(self.sync_start_date), str(self.notification_message))
