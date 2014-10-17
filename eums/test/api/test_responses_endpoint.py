import datetime
import json

from rest_framework.test import APITestCase

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


class DistributionPlanEndPointTest(APITestCase):
    def test_should_provide_sumary_data_from_node_response(self):
        ip_node = DistributionPlanNodeFactory()
        multichoice_question = MultipleChoiceQuestionFactory(label='productReceived')
        yes_option = OptionFactory(text='Yes', question=multichoice_question)
        no_option = OptionFactory(text='No', question=multichoice_question)

        sugar = ItemFactory(description='Sugar')
        salt = ItemFactory(description='Salt')

        numeric_question = NumericQuestionFactory(label='amountReceived')

        node = DistributionPlanNodeFactory(parent=ip_node)
        item = SalesOrderItemFactory(item=salt, description='10 bags of salt')
        node_line_item_one = DistributionPlanLineItemFactory(distribution_plan_node=node, targeted_quantity=100,
                                                             item=item)
        line_item_run = NodeLineItemRunFactory(node_line_item=node_line_item_one, status='completed')

        sugar_item = SalesOrderItemFactory(item=sugar, description='10 bags of sugar')
        sugar_node_line_item_one = DistributionPlanLineItemFactory(distribution_plan_node=node, targeted_quantity=100,
                                                                   item=sugar_item)
        sugar_line_item_run = NodeLineItemRunFactory(node_line_item=sugar_node_line_item_one, status='completed')

        multiple_answer_one = MultipleChoiceAnswerFactory(line_item_run=line_item_run, question=multichoice_question,
                                                          value=yes_option)
        numeric_answer_one = NumericAnswerFactory(line_item_run=line_item_run, value=80, question=numeric_question)

        MultipleChoiceAnswerFactory(line_item_run=sugar_line_item_run,
                                    question=multichoice_question, value=no_option)
        NumericAnswerFactory(line_item_run=sugar_line_item_run, value=80,
                             question=numeric_question)
        response = self.client.get("%s/" % ENDPOINT_URL, format='json')

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        expected_data = {u'item': u'10 bags of salt', u'details': [
            {u'answer': u'%s' % numeric_answer_one.format(), u'questionLabel': u'%s' % numeric_question.label},
            {u'answer': u'%s' % multiple_answer_one.format(), u'questionLabel': u'%s' % multichoice_question.label}]}
        self.assertDictContainsSubset(expected_data, response_data[0])