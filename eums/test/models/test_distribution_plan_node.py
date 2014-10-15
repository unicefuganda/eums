from unittest import TestCase

from django.conf import settings
from mock import patch

from eums.models import DistributionPlanNode
from eums.rapid_pro.fake_response import FakeResponse
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory


class DistributionPlanNodeTest(TestCase):
    def setUp(self):
        self.node = DistributionPlanNode()

    def test_should_have_all_expected_fields(self):
        fields = self.node._meta._name_map

        self.assertEqual(len(self.node._meta.fields), 8)
        for field in ['parent', 'distribution_plan', 'consignee', 'tree_position', 'location', 'mode_of_delivery',
                      'contact_person_id']:
            self.assertIn(field, fields)

    @patch('requests.get')
    def test_should_build_contact_with_details_from_contacts_service(self, mock_get):
        contact_id = '54335c56b3ae9d92f038abb0'
        fake_contact_json = {'firstName': "test", 'lastName': "user1", 'phone': "+256 782 443439", '_id': contact_id}
        fake_response = FakeResponse(fake_contact_json, 200)
        node = NodeFactory(contact_person_id=contact_id)
        mock_get.return_value = fake_response

        contact = node.build_contact()

        self.assertEqual(contact, fake_contact_json)
        mock_get.assert_called_with("%s%s/" % (settings.CONTACTS_SERVICE_URL, contact_id))

    def test_should_log_error_if_contact_error_is_encountered_when_fetching_contact_on_build_contact(self):
        pass

    @patch('requests.get')
    def test_build_contact_should_return_none_if_request_to_contacts_service_fails(self, mock_get):
        pass