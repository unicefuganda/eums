import datetime
from django.db import models
from model_utils import Choices
from model_utils.fields import StatusField

from eums.models import SystemSettings


class VisionSyncInfo(models.Model):
    STATUS = Choices('SUCCESS', 'FAILURE', 'NOT_RUNNING')
    sync_date = models.DateTimeField(auto_now_add=True)
    sync_status = StatusField(default=STATUS.NOT_RUNNING)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)
    is_daily_sync = models.BooleanField(default=True)

    def set_sync_status_success(self):
        return self._set_sync_status(VisionSyncInfo.STATUS.SUCCESS)

    def set_sync_status_failure(self):
        return self._set_sync_status(VisionSyncInfo.STATUS.FAILURE)

    def _set_sync_status(self, status):
        self.sync_status = status
        self.save()
        return self

    @staticmethod
    def new_instance(is_daily_sync, start_date, end_date):
        return VisionSyncInfo.objects.create(is_daily_sync=is_daily_sync,
                                             start_date=start_date,
                                             end_date=end_date)

    @staticmethod
    def get_daily_sync_start_date():
        if not VisionSyncInfo.objects.filter(is_daily_sync=True).count():
            last_sync_info = VisionSyncInfo.objects.filter(is_daily_sync=False).order_by('-sync_date', '-id').first()
            return last_sync_info.end_date if last_sync_info else VisionSyncInfo.get_manual_sync_start_date()

        last_sync_info = VisionSyncInfo.objects.filter(is_daily_sync=True).order_by('-sync_date', '-id').first()
        sync_start_date = last_sync_info.end_date if last_sync_info.sync_status == VisionSyncInfo.STATUS.SUCCESS \
            else last_sync_info.start_date

        return sync_start_date

    @staticmethod
    def get_daily_sync_end_date():
        return datetime.date.today()

    @staticmethod
    def get_manual_sync_start_date():
        system_settings = SystemSettings.objects.first()
        sync_start_date = system_settings.sync_start_date if system_settings else None

        return sync_start_date if sync_start_date else None

    @staticmethod
    def get_manual_sync_end_date():
        system_settings = SystemSettings.objects.first()
        sync_end_date = system_settings.sync_end_date if system_settings else None

        return sync_end_date if sync_end_date else datetime.date.today()

    @staticmethod
    def get_last_manual_sync_status():
        sync_info = VisionSyncInfo.objects.filter(is_daily_sync=False).order_by('-sync_date', '-id').first()
        return sync_info.sync_status if sync_info else None
