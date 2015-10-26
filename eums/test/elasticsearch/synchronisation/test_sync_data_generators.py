from django.conf import settings
from django.test import TestCase
from django.utils import timezone
from mock import patch
from rest_framework.status import HTTP_200_OK

from eums.elasticsearch.mappings import DELIVERY_NODE_MAPPING
from eums.elasticsearch.sync_info import SyncInfo
from eums.elasticsearch.sync_data_generators import generate_nodes_to_sync
from eums.rapid_pro.fake_response import FakeResponse
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.models import DistributionPlanNode as DeliveryNode
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory

ES_SETTINGS = settings.ELASTIC_SEARCH


# noinspection PyTypeChecker
class SyncDataGeneratorsTest(TestCase):
    @classmethod
    def setUpClass(cls):
        DeliveryNode.objects.all().delete()

    def tearDown(self):
        SyncInfo.objects.all().delete()

    @classmethod
    def tearDownClass(cls):
        DeliveryNode.objects.all().delete()

    @patch('requests.post')
    def test_should_include_all_nodes_on_first_sync(self, mock_post):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        self.assertEqual(SyncInfo.objects.count(), 0)
        node_one = DeliveryNodeFactory()
        node_two = DeliveryNodeFactory()

        nodes_to_sync = generate_nodes_to_sync()

        self.assertEqual(len(nodes_to_sync), 2)
        self.assertIn(node_one, nodes_to_sync)
        self.assertIn(node_two, nodes_to_sync)

    @patch('eums.elasticsearch.sync_data_generators.scan')
    def test_should_add_node_related_to_changed_consignee_to_sync_data(self, mock_scan):
        consignee = ConsigneeFactory(location='Old location')
        node = DeliveryNodeFactory(consignee=consignee)

        self.check_update_happens(
            node,
            consignee,
            {'field': 'location', 'value': 'New location'},
            {'term': {'consignee.id': [consignee.id]}},
            mock_scan
        )

    @patch('eums.elasticsearch.sync_data_generators.scan')
    def test_should_add_node_related_to_changed_ip_to_sync_data(self, mock_scan):
        consignee = ConsigneeFactory(location='Old location')
        parent_node = DeliveryNodeFactory(consignee=consignee)
        child_node = DeliveryNodeFactory(parents=[(parent_node, 5)])

        self.check_update_happens(
            child_node,
            consignee,
            {'field': 'location', 'value': 'New location'},
            {'term': {'ip.id': [consignee.id]}},
            mock_scan
        )

    @patch('eums.elasticsearch.sync_data_generators.scan')
    def test_should_add_node_related_to_changed_programme_to_sync_data(self, mock_scan):
        programme = ProgrammeFactory(name='Save mothers and children')
        node = DeliveryNodeFactory(programme=programme)

        self.check_update_happens(
            node,
            programme,
            {'field': 'name', 'value': 'new name'},
            {'term': {'programme.id': [programme.id]}},
            mock_scan
        )

    @patch('eums.elasticsearch.sync_data_generators.scan')
    def test_should_add_node_related_to_changed_order_item_to_sync_data(self, mock_scan):
        order_item = PurchaseOrderItemFactory(quantity=50)
        node = DeliveryNodeFactory(item=order_item)

        self.check_update_happens(
            node,
            order_item,
            {'field': 'quantity', 'value': 60},
            {'term': {'order_item.id': [order_item.id]}},
            mock_scan
        )

    @patch('eums.elasticsearch.sync_data_generators.scan')
    def test_should_add_node_related_to_changed_item_to_sync_data(self, mock_scan):
        item = ItemFactory(description="Plumpynut")
        node = DeliveryNodeFactory(item=(PurchaseOrderItemFactory(item=item)))

        self.check_update_happens(
            node,
            item,
            {'field': 'description', 'value': "Books"},
            {'term': {'order_item.item.id': [item.id]}},
            mock_scan
        )

    @patch('eums.elasticsearch.synchroniser.logger.error')
    @patch('requests.post')
    def test_should_post_node_mapping_to_elasticsearch_when_no_sync_info_exists(self, mock_post, *_):
        mock_post.return_value = FakeResponse({}, status_code=HTTP_200_OK)
        url = '%s/delivery_node/' % settings.ELASTIC_SEARCH.MAPPING
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

        self.assertEqual(len(nodes_to_sync), 2)
        self.assertIn(post_sync_node_one, nodes_to_sync)
        self.assertIn(post_sync_node_two, nodes_to_sync)
        self.assertNotIn(pre_sync_node, nodes_to_sync)

    def check_update_happens(self, node, dependency, update_params, expected_match_clause, mock_scan):
        SyncInfo.objects.create(status=SyncInfo.STATUS.SUCCESSFUL)
        nodes_to_sync = generate_nodes_to_sync()
        self.assertNotIn(node, nodes_to_sync)

        setattr(dependency, update_params['field'], update_params['value'])
        dependency.save()

        nodes_ids_to_update = [{"_id": node.id}]
        mock_scan.return_value = nodes_ids_to_update

        nodes_to_sync = generate_nodes_to_sync()

        call_args = mock_scan.call_args
        query = call_args[1]['query']
        self.assertEqual(call_args[1]['doc_type'], ES_SETTINGS.NODE_TYPE)
        self.assertDictContainsSubset({'fields': []}, query)
        self.assertIn(expected_match_clause, call_args[1]['query']['filter']['bool']['should'])

        self.assertEqual(call_args[1]['index'], ES_SETTINGS.INDEX)
        self.assertIn(node, nodes_to_sync)
