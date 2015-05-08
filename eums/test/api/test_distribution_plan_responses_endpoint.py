from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase

from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, NumericAnswerFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.node_run_factory import NodeRunFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, NumericQuestionFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class DistributionPlanResponsesEndpointTest(AuthenticatedAPITestCase):
    def test_gets_all_response_for_node_consignee(self):
        multichoice_question = MultipleChoiceQuestionFactory(label='productReceived')
        yes = multichoice_question.option_set.first()
        numeric_question = NumericQuestionFactory(label='AmountReceived')

        salt = ItemFactory(description='Salt')

        sales_order = SalesOrderFactory()
        item = SalesOrderItemFactory(item=salt, description='10 bags of salt', sales_order=sales_order)

        node = DistributionPlanNodeFactory(targeted_quantity=100,
                                           item=item)
        child_node_one = DistributionPlanNodeFactory(parent=node, targeted_quantity=50,
                                                     item=item)
        child_node_two = DistributionPlanNodeFactory(parent=node, targeted_quantity=50,
                                                     item=item)
        child_node_three = DistributionPlanNodeFactory(parent=child_node_one, targeted_quantity=50,
                                                       item=item)

        node_run = NodeRunFactory(node=node, status='completed')
        node_run_one = NodeRunFactory(node=child_node_one, status='completed')
        node_run_two = NodeRunFactory(node=child_node_two, status='completed')
        node_run_three = NodeRunFactory(node=child_node_three, status='completed')
        NumericAnswerFactory(node_run=node_run, value=80, question=numeric_question)
        MultipleChoiceAnswerFactory(node_run=node_run_one,
                                    question=multichoice_question,
                                    value=yes)
        MultipleChoiceAnswerFactory(node_run=node_run_two,
                                    question=multichoice_question, value=yes)
        NumericAnswerFactory(node_run=node_run_three, value=80, question=numeric_question)

        expected_data = {'node': node.consignee.name,
                         'children': [{'node': child_node_two.consignee.name,
                                       'children': [],
                                       'answers': {
                                           u'productReceived': u'UNCATEGORISED'}},
                                      {'node': child_node_one.consignee.name,
                                       'children': [
                                           {
                                               'node': child_node_three.consignee.name,
                                               'children': [],
                                               'answers': {
                                                   u'AmountReceived': '80'}}
                                       ],
                                       'answers': {u'productReceived': u'UNCATEGORISED'}}],
                         'answers': {u'AmountReceived': '80'}}

        endpoint_url = BACKEND_URL + 'distribution-plan-responses/%s/sales_order_item/%s/' % (
            node.consignee.id, item.id)
        response = self.client.get(endpoint_url)
        self.assertDictEqual(response.data, expected_data)