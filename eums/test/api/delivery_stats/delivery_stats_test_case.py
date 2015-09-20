from eums.fixtures.end_user_questions import *
from eums.models import Question, Programme, Consignee
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/'


class DeliveryStatsTestCase(AuthenticatedAPITestCase):
    @classmethod
    def tearDownClass(cls):
        Programme.objects.all().delete()
        Consignee.objects.all().delete()
        Flow.objects.all().delete()
        DeliveryNode.objects.all().delete()
        Question.objects.all().delete()
