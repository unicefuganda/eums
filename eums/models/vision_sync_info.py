from django.db import models
from model_utils import Choices
from model_utils.fields import StatusField

from eums.models import SystemSettings


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
    def get_sync_start_date(key):
        if not VisionSyncInfo.objects.count():
            return ''

        last_so_sync = VisionSyncInfo._get_last_successful_sync('SO')
        last_so_sync_str = last_so_sync.sync_date.strftime('%d%m%Y') if last_so_sync \
            else SystemSettings.get_sync_start_date()

        if not last_so_sync or key == 'SO':
            return last_so_sync_str

        last_po_sync = VisionSyncInfo._get_last_successful_sync('PO')
        if key == 'PO':
            if not last_po_sync:
                return last_so_sync_str
            return min(last_po_sync.sync_date, last_so_sync.sync_date).strftime('%d%m%Y')

        last_ro_sync = VisionSyncInfo._get_last_successful_sync('RO')
        if key == 'RO':
            if not last_ro_sync:
                if not last_po_sync:
                    return SystemSettings.get_sync_start_date()
                return min(last_po_sync.sync_date, last_so_sync.sync_date).strftime('%d%m%Y')
            return min(last_ro_sync.sync_date, last_po_sync.sync_date, last_so_sync.sync_date).strftime('%d%m%Y')

    @staticmethod
    def _get_last_successful_sync(which):
        key = VisionSyncInfo.NAME_MAPPING.get(which, None)
        if key:
            kwargs = {key: VisionSyncInfo.STATUS.SUCCESS}
            return VisionSyncInfo.objects.filter(**kwargs).last()
