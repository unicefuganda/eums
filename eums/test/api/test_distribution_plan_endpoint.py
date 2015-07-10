import datetime

from eums.test.api.api_test_helpers import create_programme, create_distribution_plan, create_distribution_plan_node, \
    create_consignee, create_sales_order_item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DistributionPlanEndPointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(DistributionPlanEndPointTest, self).setUp()
        self.programme = create_programme()

    def test_should_create_distribution_plan(self):
        today = datetime.date.today()
        plan_details = {'programme': self.programme.id, 'date': today}
        create_distribution_plan(self, plan_details)
        plan_details['date'] = str(today)
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(plan_details, response.data[0])

    def test_should_provide_distribution_plan_with_all_its_nodes(self):
        plan_id = create_distribution_plan(self)
        consignee = create_consignee(self)
        item = create_sales_order_item(self)
        node_details = {'distribution_plan': plan_id, 'consignee': consignee['id'], 'tree_position': 'END_USER',
                        'location': 'Kampala', 'contact_person_id': u'1234',
                        'targeted_quantity': 10, 'planned_distribution_date': '2015-01-01', 'item': item['id'],
                        'remark': 'None', 'tracked': True}

        node = create_distribution_plan_node(self, node_details)
        expected_plan_partial = {'distributionplannode_set': [node['id']]}

        response = self.client.get("%s%d/" % (ENDPOINT_URL, plan_id))

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(expected_plan_partial, response.data)