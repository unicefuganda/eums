from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import NumericAnswerFactory, MultipleChoiceAnswerFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import NumericQuestionFactory, MultipleChoiceQuestionFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


ENDPOINT_URL = BACKEND_URL + 'responses/'


class ResponsesEndPointTest(AuthenticatedAPITestCase):
    def create_questions_and_items(self):
        self.multiple_choice_question_two = MultipleChoiceQuestionFactory(label='satisfiedWithProduct')
        self.multiple_choice_question = MultipleChoiceQuestionFactory(label='productReceived')

        self.yes_option = OptionFactory(text='Yes', question=self.multiple_choice_question)
        OptionFactory(text='No', question=self.multiple_choice_question)

        self.numeric_question = NumericQuestionFactory(label='amountReceived')

        salt = ItemFactory(description='Salt')
        self.item = SalesOrderItemFactory(item=salt, description='10 bags of salt')

    def create_nodes_and_line_item(self):
        self.ip_node = DistributionPlanNodeFactory()
        self.node = DistributionPlanNodeFactory(parent=self.ip_node)
        self.node_line_item_one = DistributionPlanLineItemFactory(distribution_plan_node=self.node,
                                                                  targeted_quantity=100,
                                                                  item=self.item)

    def create_line_item_run_and_answers(self):
        self.line_item_run = NodeLineItemRunFactory(node_line_item=self.node_line_item_one, status='completed')
        self.multiple_answer_one = MultipleChoiceAnswerFactory(line_item_run=self.line_item_run,
                                                               question=self.multiple_choice_question,
                                                               value=self.yes_option)
        self.multiple_answer_two = MultipleChoiceAnswerFactory(line_item_run=self.line_item_run,
                                                               question=self.multiple_choice_question_two,
                                                               value=self.yes_option)
        self.numeric_answer_one = NumericAnswerFactory(line_item_run=self.line_item_run, value=80,
                                                       question=self.numeric_question)

    def test_should_provide_summary_data_from_node_response(self):
        self.create_questions_and_items()
        self.create_nodes_and_line_item()
        self.create_line_item_run_and_answers()

        url = "%s%d/" % (ENDPOINT_URL, self.node.consignee.id)

        response = self.client.get(url, format='json')

        consignee = self.node.consignee
        programme = self.node.distribution_plan.programme

        expected_data = {u'item': u'10 bags of salt', u'amountSent': 100, u'node': self.node.id,
                         u'consignee': {u'id': consignee.id, u'name': consignee.name, u'type': 'END_USER'},
                         u'ip': self.node.get_ip(),
                         u'%s' % self.numeric_question.label: u'%s' % self.numeric_answer_one.format(),
                         u'%s' % self.multiple_choice_question.label: u'%s' % self.multiple_answer_one.format(),
                         u'%s' % self.multiple_choice_question_two.label: u'%s' % self.multiple_answer_two.format(),
                         u'programme': {u'id': programme.id, u'name': programme.name}}

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(expected_data, response.data[0])
        self.assertEquals(expected_data, response.data[0])
