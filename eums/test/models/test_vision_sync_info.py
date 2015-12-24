import datetime

from django.test import TestCase

from eums.models import VisionSyncInfo


class VisionSyncInfoTest(TestCase):
    def setUp(self):
        self.successful_so = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.SUCCESS)
        self.successful_po = VisionSyncInfo.objects.create(po_status=VisionSyncInfo.STATUS.SUCCESS)
        self.successful_ro = VisionSyncInfo.objects.create(ro_status=VisionSyncInfo.STATUS.SUCCESS)
        self.date_2015_12_03 = datetime.datetime.fromtimestamp(1449118800)
        self.date_2015_12_15 = datetime.datetime.fromtimestamp(1450118800)
        self.date_2015_12_31 = datetime.datetime.fromtimestamp(1451538000)
        self.date_2015_12_03_str = '03122015'
        self.date_2015_12_15_str = '15122015'
        self.date_2015_12_31_str = '31122015'

    def tearDown(self):
        VisionSyncInfo.objects.all().delete()

    def test_should_get_so_sync_start_date(self):
        self.successful_so.sync_date = self.date_2015_12_03
        self.successful_so.save()
        self.successful_po.sync_date = self.date_2015_12_31
        self.successful_po.save()

        self.assertEqual(VisionSyncInfo.get_sync_start_date('SO'), self.date_2015_12_03_str)

        self.successful_so.sync_date = self.date_2015_12_31
        self.successful_so.save()
        self.successful_po.sync_date = self.date_2015_12_03
        self.successful_po.save()

        self.assertEqual(VisionSyncInfo.get_sync_start_date('SO'), self.date_2015_12_31_str)

    def test_should_get_po_sync_start_date(self):
        self.successful_so.sync_date = self.date_2015_12_03
        self.successful_so.save()
        self.successful_po.sync_date = self.date_2015_12_31
        self.successful_po.save()

        self.assertEqual(VisionSyncInfo.get_sync_start_date('PO'), self.date_2015_12_03_str)

        self.successful_so.sync_date = self.date_2015_12_31
        self.successful_so.save()
        self.successful_po.sync_date = self.date_2015_12_03
        self.successful_po.save()

        self.assertEqual(VisionSyncInfo.get_sync_start_date('PO'), self.date_2015_12_03_str)

        self.successful_so.sync_date = self.date_2015_12_03
        self.successful_so.save()
        self.successful_po.delete()
        self.assertEqual(VisionSyncInfo.get_sync_start_date('PO'), self.date_2015_12_03_str)

    def test_should_get_ro_sync_start_date(self):
        self.successful_so.sync_date = self.date_2015_12_03
        self.successful_so.save()
        self.successful_po.sync_date = self.date_2015_12_15
        self.successful_po.save()
        self.successful_ro.sync_date = self.date_2015_12_31
        self.successful_ro.save()

        self.assertEqual(VisionSyncInfo.get_sync_start_date('RO'), self.date_2015_12_03_str)

        self.successful_so.sync_date = self.date_2015_12_15
        self.successful_so.save()
        self.successful_po.sync_date = self.date_2015_12_03
        self.successful_po.save()
        self.successful_ro.sync_date = self.date_2015_12_31
        self.successful_ro.save()

        self.assertEqual(VisionSyncInfo.get_sync_start_date('RO'), self.date_2015_12_03_str)

        self.successful_so.sync_date = self.date_2015_12_15
        self.successful_so.save()
        self.successful_po.sync_date = self.date_2015_12_03
        self.successful_po.save()
        self.successful_ro.delete()

        self.assertEqual(VisionSyncInfo.get_sync_start_date('RO'), self.date_2015_12_03_str)
