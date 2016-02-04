from django.db import models


class SystemSettings(models.Model):
    auto_track = models.BooleanField(default=False)
    sync_start_date = models.DateField(null=True)
    notification_message = models.TextField(max_length=300, blank=True, default='')
    district_label = models.TextField(max_length=300, blank=True, default='District')

    class Meta:
        app_label = 'eums'

    def __unicode__(self):
        return 'SystemSettings = ' \
               '{id : %s, auto_track : %s, sync_start_date : %s, notification_message : %s, district_label : %s}' \
               % (str(self.id), str(self.auto_track), str(self.sync_start_date), str(self.notification_message),
                  str(self.district_label))

    @staticmethod
    def get_sync_start_date():
        start_date = SystemSettings.objects.first().sync_start_date
        return start_date.strftime('%d%m%Y') if start_date else ''
