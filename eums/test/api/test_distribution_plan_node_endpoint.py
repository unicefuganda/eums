from eums.test.api.api_test_helpers import create_distribution_plan_node, \
    make_node_details, create_consignee, create_sales_order_item
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.api.test_distribution_plan_endpoint import create_distribution_plan
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'


class DistributionPlanNodeEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(DistributionPlanNodeEndpointTest, self).setUp()
        self.MIDDLEMAN_POSITION = 'MIDDLE_MAN'
        self.END_USER_POSITION = 'END_USER'

    def test_should_create_distribution_plan_node_without_parent_node(self):
        plan_id = create_distribution_plan(self)
        consignee_id = create_consignee(self)['id']
        sales_order_item = create_sales_order_item(self)
        node_details = {'item': sales_order_item['id'], 'targeted_quantity': 10,
                        'planned_distribution_date': '2014-01-21', 'distribution_plan': plan_id,
                        'tree_position': self.MIDDLEMAN_POSITION,
                        'contact_person_id': u'1234',
                        'consignee': consignee_id, 'location': 'Kampala'}

        created_node_data = create_distribution_plan_node(self, node_details)

        self.assertDictContainsSubset(node_details, created_node_data)

    def test_should_create_distribution_plan_node_with_parent_node(self):
        parent_node = create_distribution_plan_node(self)
        consignee_id = create_consignee(self)['id']
        child_node_details = {'item': parent_node['item'], 'targeted_quantity': parent_node['targeted_quantity'],
                              'planned_distribution_date': parent_node['planned_distribution_date'],
                              'distribution_plan': parent_node['distribution_plan'], 'consignee': consignee_id,
                              'tree_position': self.MIDDLEMAN_POSITION, 'parent': parent_node['id'],
                              'location': 'Kampala', 'contact_person_id': u'1234'}

        created_child_node_details = create_distribution_plan_node(self, child_node_details)

        self.assertDictContainsSubset(child_node_details, created_child_node_details)

    def test_should_get_distribution_plan_node_pointing_to_parent(self):
        created_parent, created_child = self.create_distribution_plan_parent_and_child_nodes()

        returned_child = self.client.get("%s%d/" % (ENDPOINT_URL, created_child['id'])).data

        expected_child = {'parent': created_parent['id'], 'distribution_plan': created_parent['distribution_plan']}

        self.assertDictContainsSubset(expected_child, returned_child)

    def test_should_get_distribution_plan_node_with_reference_to_children(self):
        created_parent, created_child = self.create_distribution_plan_parent_and_child_nodes()

        returned_parent = self.client.get("%s%d/" % (ENDPOINT_URL, created_parent['id'])).data

        expected_parent = {
            'parent': None,
            'distribution_plan': created_parent['distribution_plan'],
            'children': [created_child['id']]
        }

        self.assertDictContainsSubset(expected_parent, returned_parent)

    def test_should_create_node_of_type_middleman(self):
        plan_id = create_distribution_plan(self)
        consignee = create_consignee(self)
        sales_order_item = create_sales_order_item(self)
        node_details = {'item': sales_order_item['id'], 'targeted_quantity': 10,
                        'planned_distribution_date': '2014-01-21',
                        'distribution_plan': plan_id, 'consignee': consignee['id'],
                        'tree_position': self.MIDDLEMAN_POSITION, 'location': 'Kampala',
                        'contact_person_id': u'1234'}

        node = create_distribution_plan_node(self, node_details=node_details)

        response = self.client.get("%s%d/" % (ENDPOINT_URL, node['id']))
        self.assertDictContainsSubset({'tree_position': node['tree_position']}, response.data)

    def test_should_create_node_of_type_end_user(self):
        plan_id = create_distribution_plan(self)
        consignee = create_consignee(self)
        sales_order_item = create_sales_order_item(self)
        node_details = {'item': sales_order_item['id'], 'targeted_quantity': 10,
                        'planned_distribution_date': '2014-01-21',
                        'distribution_plan': plan_id, 'consignee': consignee['id'],
                        'tree_position': self.END_USER_POSITION, 'location': 'Kampala',
                        'contact_person_id': u'1234'}

        node = create_distribution_plan_node(self, node_details=node_details)

        response = self.client.get("%s%d/" % (ENDPOINT_URL, node['id']))
        self.assertDictContainsSubset({'tree_position': node['tree_position']}, response.data)

    def test_should_not_create_node_with_bad_tree_position_parameter(self):
        plan_id = create_distribution_plan(self)
        consignee = create_consignee(self)
        node_details = {'distribution_plan': plan_id, 'consignee': consignee['id'],
                        'tree_position': 'UNKNOWN POSITION', 'location': 'Kampala',
                        'contact_person_id': u'1234'}

        response = self.client.post(ENDPOINT_URL, node_details, format='json')

        self.assertEqual(response.status_code, 400)

    def create_distribution_plan_parent_and_child_nodes(self, parent_details=None, child_details=None):
        created_parent_details = create_distribution_plan_node(self, parent_details)
        consignee_id = create_consignee(self)['id']
        if not child_details:
            child_details = {'item': created_parent_details['item'],
                             'targeted_quantity': created_parent_details['targeted_quantity'],
                             'planned_distribution_date': created_parent_details['planned_distribution_date'],
                             'distribution_plan': created_parent_details['distribution_plan'],
                             'consignee': consignee_id, 'location': 'Kampala',
                             'contact_person_id': u'1234',
                             'tree_position': self.MIDDLEMAN_POSITION, 'parent': created_parent_details['id']}
        created_child_details = create_distribution_plan_node(self, child_details)
        return created_parent_details, created_child_details
