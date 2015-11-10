from eums.models import Question, Programme, Consignee, Flow, Item, DistributionPlan, MultipleChoiceAnswer, \
    NumericAnswer, TextAnswer
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode

ENDPOINT_URL = BACKEND_URL + 'delivery-stats/end-user/'


class DeliveryStatsTestCase(AuthenticatedAPITestCase):
    @classmethod
    def tearDownClass(cls):

        Programme.objects.all().delete()
        Consignee.objects.all().delete()
        Flow.objects.all().delete()
        DeliveryNode.objects.all().delete()
        Question.objects.all().delete()
        Item.objects.all().delete()
        MultipleChoiceAnswer.objects.all().delete()
        NumericAnswer.objects.all().delete()
        TextAnswer.objects.all().delete()
        DistributionPlan.objects.all().delete()

    def assert_ip_delivery_stats(self, response, expected_stats):
        self.assertEqual(len(response.data), len(expected_stats))
        for stat in expected_stats:
            self.assertIn(stat, response.data)
