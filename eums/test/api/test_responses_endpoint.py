import json

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


class DistributionPlanEndPointTest(AuthenticatedAPITestCase):
    def test_should_provide_summary_data_from_node_response(self):
        ip_node = DistributionPlanNodeFactory()
        multiple_choice_question = MultipleChoiceQuestionFactory(label='productReceived')
        yes_option = OptionFactory(text='Yes', question=multiple_choice_question)
        OptionFactory(text='No', question=multiple_choice_question)

        salt = ItemFactory(description='Salt')

        numeric_question = NumericQuestionFactory(label='amountReceived')

        node = DistributionPlanNodeFactory(parent=ip_node)
        item = SalesOrderItemFactory(item=salt, description='10 bags of salt')
        node_line_item_one = DistributionPlanLineItemFactory(distribution_plan_node=node, targeted_quantity=100,
                                                             item=item)
        line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item_one, status='completed')

        multiple_answer_one = MultipleChoiceAnswerFactory(line_item_run=line_item_run,
                                                          question=multiple_choice_question,
                                                          value=yes_option)
        numeric_answer_one = NumericAnswerFactory(line_item_run=line_item_run, value=80, question=numeric_question)

        url = "%s%d/" % (ENDPOINT_URL, node.consignee.id)

        response = self.client.get(url, format='json')

        consignee = node.consignee

        expected_data = {u'item': u'10 bags of salt', u'amountSent': 100, u'node': node.id,
                         u'consignee': {u'id': consignee.id, u'name': consignee.name},
                         u'%s' % numeric_question.label: u'%s' % numeric_answer_one.format(),
                         u'%s' % multiple_choice_question.label: u'%s' % multiple_answer_one.format()}

        self.assertEqual(response.status_code, 200)
        self.assertDictContainsSubset(expected_data, response.data[0])
