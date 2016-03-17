import datetime

from django.test import TestCase
from mock import patch

from eums.models import VisionSyncInfo, SystemSettings
from eums.test.helpers.fake_datetime import FakeDate


class VisionSyncInfoTest(TestCase):
    @patch('datetime.date', FakeDate)
    def test_should_get_daily_sync_end_date(self):
        self.assertEqual(VisionSyncInfo.get_daily_sync_end_date(), datetime.date(2014, 9, 25))

    def test_should_get_daily_sync_start_date(self):
        system_settings = SystemSettings.objects.create()

        self.assertEqual(VisionSyncInfo.get_daily_sync_start_date(), None)

        system_settings.sync_start_date = datetime.date(2016, 3, 13)
        system_settings.save()

        self.assertEqual(VisionSyncInfo.get_daily_sync_start_date(), datetime.date(2016, 3, 13))

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 14),
                                      sync_status=VisionSyncInfo.STATUS.SUCCESS,
                                      start_date=datetime.date(2016, 3, 13),
                                      end_date=datetime.date(2016, 3, 14),
                                      is_daily_sync=False)

        self.assertEqual(VisionSyncInfo.get_daily_sync_start_date(), datetime.date(2016, 3, 14))

    def test_should_get_daily_sync_start_date_when_all_sync_successfully(self):
        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 13),
                                      sync_status=VisionSyncInfo.STATUS.SUCCESS,
                                      start_date=datetime.date(2016, 3, 12),
                                      end_date=datetime.date(2016, 3, 13),
                                      is_daily_sync=True)

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 14),
                                      sync_status=VisionSyncInfo.STATUS.SUCCESS,
                                      start_date=datetime.date(2016, 3, 13),
                                      end_date=datetime.date(2016, 3, 14),
                                      is_daily_sync=True)

        self.assertEqual(VisionSyncInfo.get_daily_sync_start_date(), datetime.date(2016, 3, 14))

    def test_should_get_daily_sync_start_date_when_last_sync_fail(self):
        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 14),
                                      sync_status=VisionSyncInfo.STATUS.SUCCESS,
                                      start_date=datetime.date(2016, 3, 13),
                                      end_date=datetime.date(2016, 3, 14),
                                      is_daily_sync=True)

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 15),
                                      sync_status=VisionSyncInfo.STATUS.FAILURE,
                                      start_date=datetime.date(2016, 3, 14),
                                      end_date=datetime.date(2016, 3, 15),
                                      is_daily_sync=True)

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 16),
                                      sync_status=VisionSyncInfo.STATUS.FAILURE,
                                      start_date=datetime.date(2016, 1, 1),
                                      end_date=datetime.date(2016, 3, 16),
                                      is_daily_sync=False)

        self.assertEqual(VisionSyncInfo.get_daily_sync_start_date(), datetime.date(2016, 3, 14))

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 16),
                                      sync_status=VisionSyncInfo.STATUS.FAILURE,
                                      start_date=datetime.date(2016, 3, 14),
                                      end_date=datetime.date(2016, 3, 16),
                                      is_daily_sync=True)

        self.assertEqual(VisionSyncInfo.get_daily_sync_start_date(), datetime.date(2016, 3, 14))

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 17),
                                      sync_status=VisionSyncInfo.STATUS.SUCCESS,
                                      start_date=datetime.date(2016, 3, 14),
                                      end_date=datetime.date(2016, 3, 17),
                                      is_daily_sync=True)

        self.assertEqual(VisionSyncInfo.get_daily_sync_start_date(), datetime.date(2016, 3, 17))

    def test_should_get_manual_sync_start_date(self):
        system_settings = SystemSettings.objects.create()
        self.assertEqual(VisionSyncInfo.get_manual_sync_start_date(), None)

        system_settings.sync_start_date = datetime.date(2016, 3, 12)
        system_settings.save()
        self.assertEqual(VisionSyncInfo.get_manual_sync_start_date(), datetime.date(2016, 3, 12))

    @patch('datetime.date', FakeDate)
    def test_should_get_manual_sync_end_date_at_first_time(self):
        self.assertEqual(VisionSyncInfo.get_manual_sync_end_date(), datetime.date(2014, 9, 25))

    def test_should_get_last_manual_sync_status(self):
        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 13),
                                      sync_status=VisionSyncInfo.STATUS.SUCCESS,
                                      start_date=datetime.date(2016, 3, 12),
                                      end_date=datetime.date(2016, 3, 13),
                                      is_daily_sync=False)

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 14),
                                      sync_status=VisionSyncInfo.STATUS.FAILURE,
                                      start_date=datetime.date(2016, 3, 13),
                                      end_date=datetime.date(2016, 3, 14),
                                      is_daily_sync=True)

        self.assertEqual(VisionSyncInfo.get_last_manual_sync_status(), VisionSyncInfo.STATUS.SUCCESS)

        VisionSyncInfo.objects.create(sync_date=datetime.date(2016, 3, 15),
                                      sync_status=VisionSyncInfo.STATUS.FAILURE,
                                      start_date=datetime.date(2016, 3, 13),
                                      end_date=datetime.date(2016, 3, 15),
                                      is_daily_sync=False)

        self.assertEqual(VisionSyncInfo.get_last_manual_sync_status(), VisionSyncInfo.STATUS.FAILURE)
