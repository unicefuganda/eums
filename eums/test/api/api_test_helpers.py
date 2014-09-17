from django.contrib.auth.models import User

from eums.models import Programme
from eums.test.config import BACKEND_URL


DISTRIBUTION_PLAN_ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'
DISTRIBUTION_PLAN_NODE_ENDPOINT_URL = BACKEND_URL + 'distribution-plan-node/'


def create_distribution_plan(test_case, plan_details=None):
    if not plan_details:
        programme = create_programme()
        plan_details = {'programme': programme.id}
    response = test_case.client.post(DISTRIBUTION_PLAN_ENDPOINT_URL, plan_details, format='json')
    test_case.assertEqual(response.status_code, 201)
    return response.data['id']


def create_programme():
    focal_person, _ = User.objects.get_or_create(
        username="Test", first_name="Test", last_name="User", email="me@you.com"
    )
    programme, _ = Programme.objects.get_or_create(focal_person=focal_person, name="Alive")
    return programme


def create_distribution_plan_node(test_case, node_details=None):
    plan_id = create_distribution_plan(test_case)
    if not node_details:
        node_details = {'distribution_plan': plan_id}

    response = test_case.client.post(DISTRIBUTION_PLAN_NODE_ENDPOINT_URL, node_details, format='json')
    test_case.assertEqual(response.status_code, 201)
    return response.data