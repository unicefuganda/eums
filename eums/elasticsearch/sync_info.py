from django.db import models
from djorm_pgarray.fields import IntegerArrayField
from model_utils import Choices
from model_utils.fields import StatusField


class SyncInfo(models.Model):
    STATUS = Choices('SUCCESSFUL', 'FAILED', 'RUNNING')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    status = StatusField(default=STATUS.RUNNING)

    @staticmethod
    def last_successful_sync():
        return SyncInfo.objects.filter(status=SyncInfo.STATUS.SUCCESSFUL).last()
