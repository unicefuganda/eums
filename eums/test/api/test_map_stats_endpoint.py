from decimal import Decimal

from eums.fixtures.end_user_questions import *
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.models.distribution_plan_node import DistributionPlanNode as DeliveryNode
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'map-stats/'


class DistrictStatsEndpointTest(AuthenticatedAPITestCase):
    @classmethod
    def setUpClass(cls):
        super(DistrictStatsEndpointTest, cls).setUpClass()
        seed_questions()

    def setUp(self):
        super(DistrictStatsEndpointTest, self).setUp()
        end_user_node_one = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_one),
            question=WAS_PRODUCT_RECEIVED,
            value=PRODUCT_WAS_RECEIVED
        )

        end_user_node_two = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_two),
            question=WAS_PRODUCT_RECEIVED,
            value=PRODUCT_WAS_RECEIVED
        )

        end_user_node_three = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_three),
            question=WAS_PRODUCT_RECEIVED,
            value=PRODUCT_WAS_NOT_RECEIVED
        )

        end_user_node_four = DeliveryNodeFactory()
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_four),
            question=WAS_PRODUCT_RECEIVED,
            value=PRODUCT_WAS_NOT_RECEIVED
        )

        end_user_node_five = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True)
        MultipleChoiceAnswerFactory(
            run=RunFactory(runnable=end_user_node_five),
            question=WAS_PRODUCT_RECEIVED,
            value=PRODUCT_WAS_NOT_RECEIVED
        )

        non_response_node = DeliveryNodeFactory(tree_position=DeliveryNode.END_USER, track=True)
        RunFactory(runnable=non_response_node)

    # def test_should_get_counts_and_percentages_of_answers_to_product_received_question(self):
    #     response = self.client.get('%s?consigneeType=END_USER' % ENDPOINT_URL)
    #     print '********************, data:', response.data
    #     expected = {
    #         'numberOfSuccessfulProductDeliveries': 2,
    #         'percentageOfSuccessfulDeliveries': Decimal('33.3'),
    #         'numberOfUnSuccessfulProductDeliveries': 3,
    #         'percentageOfUnSuccessfulDeliveries': Decimal('50.0'),
    #         'numberOfNonResponseToProductReceived': 1,
    #         'percentageOfNonResponseToProductReceived': Decimal('16.7'),
    #     }
    #     self.assertDictContainsSubset(expected, response.data)


'''
        - Total Value sent (TV)

        - total value received
        - percent received/sent
        - # of YES responses to "Did you receive?"
        - percent YES/total-qns-sent (TQ)

        - total not received
        - percent not-received/sent
        - # of NO responses to "Did you receive?"
        - percent NO/total-qns-sent

        - non-response to did you receive
        - # of NON-RESPONSE to "Did you receive?"
        - percent NON-RESPONSE/total-qns-sent

        - value NO-ISSUES
        - percent NO-ISSUES/TV
        - #of NO-ISSUES responses
        - percent of NO-ISSUES/TQ

        - value WITH-ISSUES
        - percent WITH-ISSUES/TV
        - #of WITH-ISSUES responses
        - percent of WITH-ISSUES/TQ

        - value NO-RESPONSE to Quality qn
        - percent NO-RESPONSE/TV
        - #of NO-RESPONSE responses
        - percent of NO-RESPONSE/TQ

        - value SATISFIED
        - percent SATISFIED/TV
        - #of SATISFIED responses
        - percent of SATISFIED/TQ

        - value NOT-SATISFIED
        - percent NOT-SATISFIED/TV
        - #of NOT-SATISFIED responses
        - percent of NOT-SATISFIED/TQ
    '''
