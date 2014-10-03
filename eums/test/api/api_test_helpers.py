from django.contrib.auth.models import User

from eums.models import Programme, ItemUnit, Item
from eums.test.config import BACKEND_URL


DISTRIBUTION_PLAN_ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'
DISTRIBUTION_PLAN_NODE_ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'
DISTRIBUTION_PLAN_LINE_ITEM_ENDPOINT_URL = BACKEND_URL + 'distribution-plan-line-item/'
CONSIGNEE_ENDPOINT_URL = BACKEND_URL + 'consignee/'
ITEM_UNIT_ENDPOINT_URL = BACKEND_URL + 'item-unit/'
ITEM_ENDPOINT_URL = BACKEND_URL + 'item/'
USER_ENDPOINT_URL = BACKEND_URL + 'user/'
SALES_ORDER_ENDPOINT_URL = BACKEND_URL + 'sales-order/'
SALES_ORDER_ITEM_ENDPOINT_URL = BACKEND_URL + 'sales-order-item/'


def create_distribution_plan(test_case, plan_details=None):
    if not plan_details:
        programme = create_programme()
        plan_details = {'programme': programme.id, 'name': 'Plan 1'}
    response = test_case.client.post(DISTRIBUTION_PLAN_ENDPOINT_URL, plan_details, format='json')
    test_case.assertEqual(response.status_code, 201)
    return response.data['id']


def create_programme():
    focal_person, _ = User.objects.get_or_create(
        username="Test", first_name="Test", last_name="User", email="me@you.com"
    )
    programme, _ = Programme.objects.get_or_create(focal_person=focal_person, name="Alive")
    return programme


def create_consignee(test_case, consignee_details=None):
    if not consignee_details:
        consignee_details = {'name': "Save the Children", 'contact_person_id': u'1234'}
    response = test_case.client.post(CONSIGNEE_ENDPOINT_URL, consignee_details, format='json')
    test_case.assertEqual(response.status_code, 201)
    return response.data


def create_distribution_plan_node(test_case, node_details=None):
    plan_id = create_distribution_plan(test_case)
    if not node_details:
        consignee = create_consignee(test_case)
        node_details = {'distribution_plan': plan_id, 'consignee': consignee['id']}

    response = test_case.client.post(DISTRIBUTION_PLAN_NODE_ENDPOINT_URL, node_details, format='json')
    test_case.assertEqual(response.status_code, 201)
    return response.data


def make_line_item_details(test_case, node_id=None):
    item_unit = ItemUnit.objects.create(name='EA')
    item = Item.objects.create(description='Item 1', unit=item_unit)

    if not node_id:
        node_id = create_distribution_plan_node(test_case)['id']

    line_item = {'item': item.id, 'quantity': 10, 'under_current_supply_plan': False,
                 'planned_distribution_date': '2014-01-21', 'destination_location': 'GULU',
                 'remark': "Dispatched", 'distribution_plan_node': node_id}

    return line_item


def create_distribution_plan_line_item(test_case, item_details=None):
    if not item_details:
        item_details = make_line_item_details(test_case)
    response = test_case.client.post(DISTRIBUTION_PLAN_LINE_ITEM_ENDPOINT_URL, item_details, format='json')

    test_case.assertEqual(response.status_code, 201)

    formatted_data = response.data
    formatted_data['planned_distribution_date'] = str(formatted_data['planned_distribution_date'])

    return formatted_data


def create_sales_order(test_case, sales_order_details=None):
    if not sales_order_details:
        sales_order_details = {'order_number': "23E3EA"}

    response = test_case.client.post(SALES_ORDER_ENDPOINT_URL, sales_order_details, format='json')
    test_case.assertEqual(response.status_code, 201)

    return response.data


def create_sales_order_item(test_case, sales_order_item_details=None):
    response = test_case.client.post(SALES_ORDER_ITEM_ENDPOINT_URL, sales_order_item_details, format='json')

    test_case.assertEqual(response.status_code, 201)

    formatted_data = response.data
    formatted_data['issue_date'] = str(formatted_data['issue_date'])
    formatted_data['delivery_date'] = str(formatted_data['delivery_date'])

    return formatted_data


def create_item_unit(test_case, item_unit_details=None):
    if not item_unit_details:
        item_unit_details = {'name': "EA"}

    response = test_case.client.post(ITEM_UNIT_ENDPOINT_URL, item_unit_details, format='json')
    test_case.assertEqual(response.status_code, 201)

    return response.data


def create_item(test_case, item_details=None):
    if not item_details:
        item_details = {'description': "Item description", 'material_code': "code2344",
                        'unit': create_item_unit(test_case)['id']}

    response = test_case.client.post(ITEM_ENDPOINT_URL, item_details, format='json')

    test_case.assertEqual(response.status_code, 201)

    return response.data


def create_user(test_case, user_details=None):
    if not user_details:
        user_details = {'username': 'test_user', 'first_name': 'test', 'last_name': 'user', 'email': 'test@email.com'}

    response = test_case.client.post(USER_ENDPOINT_URL, user_details, format='json')
    test_case.assertEqual(response.status_code, 201)

    return response.data