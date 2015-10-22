from django.test import TestCase
from django.utils import timezone
from eums.elasticsearch.sync_info import SyncInfo


class SyncInfoTest(TestCase):
    def test_should_provide_last_successful_sync(self):
        self.assertIsNone(SyncInfo.last_successful_sync())

        start_time = timezone.now()
        successful_sync = SyncInfo.objects.create(status=SyncInfo.STATUS.SUCCESSFUL, start_time=start_time)
        self.assertEqual(SyncInfo.last_successful_sync(), successful_sync)

        SyncInfo.objects.create(status=SyncInfo.STATUS.FAILED, start_time=start_time)
        self.assertEqual(SyncInfo.last_successful_sync(), successful_sync)
