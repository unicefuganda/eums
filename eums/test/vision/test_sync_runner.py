import datetime
from unittest import TestCase

from eums.models import VisionSyncInfo
from eums.vision.sync_runner import _convert_date_format, _get_last_sync_date


class TestSyncRunner(TestCase):
    def setUp(self):
        self.date_2015_12_03 = datetime.datetime.fromtimestamp(1449118800)
        self.date_2015_12_31 = datetime.datetime.fromtimestamp(1451538000)
        self.date_2015_12_03_str = '03122015'
        self.date_2015_12_31_str = '31122015'

    def tearDown(self):
        VisionSyncInfo.objects.all().delete()

    def test_should_convert_date_time(self):
        self.assertEqual(_convert_date_format(self.date_2015_12_03), self.date_2015_12_03_str)
        self.assertEqual(_convert_date_format(self.date_2015_12_31), self.date_2015_12_31_str)

    def test_should_get_last_so_sync_date(self):
        so_success = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.SUCCESS)
        so_success.sync_time = self.date_2015_12_03
        so_success.save()

        so_failure = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.FAILURE)
        so_failure.sync_time = self.date_2015_12_31
        so_failure.save()

        self.assertEqual(_get_last_sync_date('SO'), self.date_2015_12_03_str)

    def test_should_get_last_po_sync_date(self):
        po_success = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.SUCCESS,
                                                   po_status=VisionSyncInfo.STATUS.SUCCESS)
        po_success.sync_time = self.date_2015_12_03
        po_success.save()

        self.assertEqual(_get_last_sync_date('PO'), self.date_2015_12_03_str)
        
        po_failure = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.FAILURE,
                                                   po_status=VisionSyncInfo.STATUS.SUCCESS)
        po_failure.sync_time = self.date_2015_12_31
        po_failure.save()

        self.assertEqual(_get_last_sync_date('PO'), self.date_2015_12_03_str)

    def test_should_get_last_ro_sync_date(self):
        ro_success = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.SUCCESS,
                                                   ro_status=VisionSyncInfo.STATUS.SUCCESS)
        ro_success.sync_time = self.date_2015_12_03
        ro_success.save()

        self.assertEqual(_get_last_sync_date('RO'), self.date_2015_12_03_str)

        ro_failure = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.FAILURE,
                                                   ro_status=VisionSyncInfo.STATUS.SUCCESS)
        ro_failure.sync_time = self.date_2015_12_31
        ro_failure.save()

        self.assertEqual(_get_last_sync_date('RO'), self.date_2015_12_03_str)