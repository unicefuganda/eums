from django.test import TestCase
from django.utils import timezone

from eums.elasticsearch.sync_info import SyncInfo
from eums.elasticsearch.synchroniser import generate_nodes_to_sync, run
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


class SynchroniserTest(TestCase):
    def tearDown(self):
        SyncInfo.objects.all().delete()

    def test_should_create_a_sync_info_record_when_sync_starts(self):
        self.assertEqual(SyncInfo.objects.count(), 0)
        run()
        self.assertEqual(SyncInfo.objects.count(), 1)

    def test_should_include_new_nodes_in_sync_queryset(self):
        pre_sync_node = DeliveryNodeFactory()

        last_sync_time = timezone.now()
        SyncInfo.objects.create(status=SyncInfo.STATUS.SUCCESSFUL, start_time=last_sync_time)
        post_sync_node_one = DeliveryNodeFactory()
        post_sync_node_two = DeliveryNodeFactory()

        nodes_to_sync = generate_nodes_to_sync()

        self.assertEqual(nodes_to_sync.count(), 2)
        self.assertIn(post_sync_node_one, nodes_to_sync)
        self.assertIn(post_sync_node_two, nodes_to_sync)
        self.assertNotIn(pre_sync_node, nodes_to_sync)
