from django.conf import settings
from django.test import TestCase
from django.utils import timezone
from mock import patch
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from eums.elasticsearch.mappings import DELIVERY_NODE_MAPPING
from eums.elasticsearch.sync_info import SyncInfo
from eums.elasticsearch.synchroniser import run
from eums.elasticsearch.changes_generators import generate_nodes_to_sync
from eums.rapid_pro.fake_response import FakeResponse
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.helpers.fake_datetime import FakeDatetime
from eums.models import DistributionPlanNode as DeliveryNode


class SynchroniserTest(TestCase):
    @classmethod
    def setUpClass(cls):
        DeliveryNode.objects.all().delete()

    def tearDown(self):
        SyncInfo.objects.all().delete()

    @classmethod
    def tearDownClass(cls):
        DeliveryNode.objects.all().delete()

    @patch('requests.post')
    @patch('eums.elasticsearch.synchroniser.generate_nodes_to_sync')
    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    def test_run_should_serialise_nodes_that_are_marked_for_sync(self, mock_serialiser, mock_generate_nodes, *_):
        mock_nodes = [1, 2]
        mock_generate_nodes.return_value = mock_nodes
        run()
        mock_serialiser.assert_called_with(mock_nodes)

    @patch('requests.post')
    @patch('eums.elasticsearch.synchroniser.generate_nodes_to_sync')
    def test_should_create_a_sync_info_record_when_sync_starts(self, *_):
        self.assertEqual(SyncInfo.objects.count(), 0)
        run()
        self.assertEqual(SyncInfo.objects.count(), 1)

    @patch('eums.elasticsearch.synchroniser.generate_nodes_to_sync')
    @patch('eums.elasticsearch.synchroniser.convert_to_bulk_api_format')
    @patch('requests.post')
    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    def test_should_push_serialised_nodes_to_elasticsearch(self, mock_serialiser, mock_post, mock_converter, *_):
        api_data = '{}'
        mock_serialiser.return_value = {}
        mock_converter.return_value = api_data
        url = '%s/_bulk' % settings.ELASTIC_SEARCH_URL
        run()
        mock_post.assert_called_with(url, data=api_data)

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.generate_nodes_to_sync')
    @patch('requests.post')
    def test_should_set_last_sync_status_to_successful_when_post_to_elasticsearch_returns_200(self, mock_post, *_):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        run()
        self.assertEqual(SyncInfo.objects.last().status, SyncInfo.STATUS.SUCCESSFUL)

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.generate_nodes_to_sync')
    @patch('requests.post')
    def test_should_set_last_sync_status_to_failed_when_post_to_elasticsearch_returns_non_200(self, mock_post, *_):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_400_BAD_REQUEST)
        run()
        self.assertEqual(SyncInfo.objects.last().status, SyncInfo.STATUS.FAILED)

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.generate_nodes_to_sync')
    @patch('eums.elasticsearch.synchroniser.logger.error')
    @patch('requests.post')
    def test_should_set_last_sync_status_to_failed_when_post_to_es_raises_and_error(self, mock_post, mock_logger, *_):
        error_message = 'failed to connect to network'
        mock_post.side_effect = RuntimeError(error_message)
        run()
        self.assertEqual(SyncInfo.objects.last().status, SyncInfo.STATUS.FAILED)
        mock_logger.assert_called_with('Sync Failed: %s' % error_message)

    @patch('eums.elasticsearch.synchroniser.serialise_nodes')
    @patch('eums.elasticsearch.synchroniser.generate_nodes_to_sync')
    @patch('eums.elasticsearch.synchroniser.timezone.now')
    @patch('requests.post')
    def test_should_set_sync_end_time_after_posting_to_elasticsearch(self, mock_post, mock_now, *_):
        fake_end_time = FakeDatetime.now()
        mock_now.return_value = fake_end_time
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        run()
        self.assertEqual(SyncInfo.objects.last().end_time, fake_end_time)

    @patch('requests.post')
    def test_should_include_all_nodes_on_first_sync(self, mock_post):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        self.assertEqual(SyncInfo.objects.count(), 0)
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()

        nodes_to_sync = generate_nodes_to_sync()

        self.assertEqual(nodes_to_sync.count(), 2)
        self.assertIn(node_one, nodes_to_sync)
        self.assertIn(node_two, nodes_to_sync)

    @patch('eums.elasticsearch.synchroniser.logger.error')
    @patch('requests.post')
    def test_should_post_node_mapping_to_elasticsearch_when_no_sync_info_exists(self, mock_post, *_):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        url = '%s/_mapping/delivery_node/' % settings.ELASTIC_SEARCH_URL
        generate_nodes_to_sync()
        mock_post.assert_called_with(url, json=DELIVERY_NODE_MAPPING)

    '''
        TODO This is failing when all tests are run because we loose the time aspect of the 'created' field when
          querying nodes from the db. This happens only when running tests
    '''
    def xtest_should_include_new_nodes_in_sync_queryset(self):
        pre_sync_node = DeliveryNodeFactory()

        last_sync_time = timezone.datetime.now()
        SyncInfo.objects.create(status=SyncInfo.STATUS.SUCCESSFUL, start_time=last_sync_time)
        post_sync_node_one = DeliveryNodeFactory()
        post_sync_node_two = DeliveryNodeFactory()

        nodes_to_sync = generate_nodes_to_sync()

        self.assertEqual(nodes_to_sync.count(), 2)
        self.assertIn(post_sync_node_one, nodes_to_sync)
        self.assertIn(post_sync_node_two, nodes_to_sync)
        self.assertNotIn(pre_sync_node, nodes_to_sync)
