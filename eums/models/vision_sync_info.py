from django.db import models
from model_utils import Choices
from model_utils.fields import StatusField


class VisionSyncInfo(models.Model):
    NAME_MAPPING = {'SO': 'so_status',
                    'PO': 'po_status',
                    'RO': 'ro_status',
                    'CONSIGNEE': 'consignee_status',
                    'PROGRAMME': 'programme_status'}
    STATUS = Choices('SUCCESS', 'FAILURE', 'NOT_RUNNING')
    sync_date = models.DateTimeField(auto_now_add=True)
    so_status = StatusField(default=STATUS.NOT_RUNNING)
    po_status = StatusField(default=STATUS.NOT_RUNNING)
    ro_status = StatusField(default=STATUS.NOT_RUNNING)
    consignee_status = StatusField(default=STATUS.NOT_RUNNING)
    programme_status = StatusField(default=STATUS.NOT_RUNNING)

    def __unicode__(self):
        return "sync_time=%s, so_status=%s, po_status=%s, ro_status=%s, consignee_status=%s, programme=%s" \
               % str(self.sync_date), self.so_status, self.po_status, \
               self.ro_status, self.consignee_status, self.programme_status

    def set_sync_status_success(self, which):
        return self._set_sync_status(which, VisionSyncInfo.STATUS.SUCCESS)

    def set_sync_status_failure(self, which):
        return self._set_sync_status(which, VisionSyncInfo.STATUS.FAILURE)

    def _set_sync_status(self, which, status):
        name = VisionSyncInfo.NAME_MAPPING.get(which, None)
        if name:
            setattr(self, name, status)
            self.save()
            return self

    @staticmethod
    def new_instance():
        return VisionSyncInfo.objects.create()

    @staticmethod
    def get_last_successful_sync(which):
        key = VisionSyncInfo.NAME_MAPPING.get(which, None)
        if key:
            kwargs = {key: VisionSyncInfo.STATUS.SUCCESS}
            return VisionSyncInfo.objects.filter(**kwargs).last()
