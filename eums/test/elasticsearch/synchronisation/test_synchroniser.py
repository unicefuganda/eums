from django.conf import settings
from django.test import TestCase
from mock import patch
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from eums.elasticsearch.delete_records import DeleteRecords

from eums.elasticsearch.sync_info import SyncInfo
from eums.elasticsearch.synchroniser import run
from eums.rapid_pro.fake_response import FakeResponse
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.helpers.fake_datetime import FakeDatetime
from eums.models import DistributionPlanNode as DeliveryNode


class SynchroniserTest(TestCase):
    @classmethod
    def setUpClass(cls):
        DeliveryNode.objects.all().delete()
        DeleteRecords.objects.all().delete()

    def tearDown(self):
        SyncInfo.objects.all().delete()

    @classmethod
    def tearDownClass(cls):
        DeliveryNode.objects.all().delete()
        DeleteRecords.objects.all().delete()

    @patch('requests.post')
    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    def test_run_should_serialise_nodes_that_are_marked_for_sync(self, mock_serialiser, mock_generate_nodes, *_):
        mock_nodes = [1, 2]
        mock_generate_nodes.return_value = mock_nodes
        run()
        mock_serialiser.assert_called_with(mock_nodes)

    @patch('requests.post')
    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    def test_should_create_a_sync_info_record_when_sync_starts(self, *_):
        self.assertEqual(SyncInfo.objects.count(), 0)
        run()
        self.assertEqual(SyncInfo.objects.count(), 1)

    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    @patch('eums.elasticsearch.synchroniser.convert_to_bulk_api_format')
    @patch('requests.post')
    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    def test_should_push_updated_nodes_to_elasticsearch(self, mock_serialiser, mock_post, mock_converter, *_):
        api_data = '{}'
        mock_serialiser.return_value = {}
        mock_converter.return_value = api_data
        run()
        mock_post.assert_called_with(settings.ELASTIC_SEARCH.BULK, data=api_data)

    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    @patch('eums.elasticsearch.synchroniser.convert_to_bulk_api_format')
    @patch('requests.post')
    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    def test_should_push_deleted_nodes_to_elasticsearch(self, mock_serialise_nodes,
                                                        mock_post, mock_converter, *_):
        node = DeliveryNodeFactory()
        run()
        node.delete()

        api_data = '{}'
        stub_nodes_to_update = {'id': 10}
        mock_serialise_nodes.return_value = stub_nodes_to_update
        mock_converter.return_value = api_data
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)

        run()

        mock_converter.assert_called_with(stub_nodes_to_update, [node.id])
        mock_post.assert_called_with(settings.ELASTIC_SEARCH.BULK, data=api_data)
        self.assertListEqual(DeleteRecords.objects.first().nodes_to_delete, [])

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    @patch('requests.post')
    def test_should_set_last_sync_status_to_successful_when_post_to_elasticsearch_returns_200(self, mock_post, *_):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        run()
        self.assertEqual(SyncInfo.objects.last().status, SyncInfo.STATUS.SUCCESSFUL)

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    @patch('requests.post')
    def test_should_set_last_sync_status_to_failed_when_post_to_elasticsearch_returns_non_200(self, mock_post, *_):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_400_BAD_REQUEST)
        run()
        self.assertEqual(SyncInfo.objects.last().status, SyncInfo.STATUS.FAILED)

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    @patch('eums.elasticsearch.synchroniser.logger.error')
    @patch('requests.post')
    def test_should_set_last_sync_status_to_failed_when_post_to_es_raises_and_error(self, mock_post, mock_logger, *_):
        error_message = 'failed to connect to network'
        mock_post.side_effect = RuntimeError(error_message)
        run()
        self.assertEqual(SyncInfo.objects.last().status, SyncInfo.STATUS.FAILED)
        mock_logger.assert_called_with('Sync Failed: %s' % error_message)

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.list_nodes_to_update')
    @patch('eums.elasticsearch.synchroniser.timezone.now')
    @patch('requests.post')
    def test_should_set_sync_end_time_after_posting_to_elasticsearch(self, mock_post, mock_now, *_):
        fake_end_time = FakeDatetime.now()
        mock_now.return_value = fake_end_time
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        run()
        self.assertEqual(SyncInfo.objects.last().end_time, fake_end_time)
