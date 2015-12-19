from datetime import datetime

from django.test import TestCase

from eums.models import VisionSyncInfo


class VisionSyncInfoTest(TestCase):
    def setUp(self):
        self.successful_ro = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.FAILURE,
                                                           po_status=VisionSyncInfo.STATUS.FAILURE,
                                                           ro_status=VisionSyncInfo.STATUS.SUCCESS)

        self.successful_so = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.SUCCESS,
                                                           po_status=VisionSyncInfo.STATUS.FAILURE,
                                                           ro_status=VisionSyncInfo.STATUS.FAILURE)

        self.successful_po = VisionSyncInfo.objects.create(so_status=VisionSyncInfo.STATUS.FAILURE,
                                                           po_status=VisionSyncInfo.STATUS.SUCCESS,
                                                           ro_status=VisionSyncInfo.STATUS.FAILURE)

    def tearDown(self):
        VisionSyncInfo.objects.all().delete()

    def test_should_get_last_successful_so_status(self):
        self.assertEqual(VisionSyncInfo.get_last_successful_sync('SO'), self.successful_so)

    def test_should_get_last_successful_po_status(self):
        self.assertEqual(VisionSyncInfo.get_last_successful_sync('PO'), self.successful_po)

    def test_should_get_last_successful_ro_status(self):
        self.assertEqual(VisionSyncInfo.get_last_successful_sync('RO'), self.successful_ro)

    def test_should_have_default_status_as_running(self):
        self.assertEqual(self.successful_po.consignee_status, VisionSyncInfo.STATUS.NOT_RUNNING)
        self.assertEqual(self.successful_po.programme_status, VisionSyncInfo.STATUS.NOT_RUNNING)

    def test_should_assign_sync_time_automatically(self):
        self.assertIsInstance(self.successful_po.sync_time, datetime)

    def test_should_set_status(self):
        sync_info = VisionSyncInfo.new_instance()
        sync_info.set_sync_status_success('SO')
        sync_info.set_sync_status_failure('PO')

        self.assertEqual(sync_info.so_status, VisionSyncInfo.STATUS.SUCCESS)
        self.assertEqual(sync_info.po_status, VisionSyncInfo.STATUS.FAILURE)
