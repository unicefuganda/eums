from unittest import TestCase

from django.conf import settings
from mock import patch

from eums.models import DistributionPlanNode
from eums.rapid_pro.fake_response import FakeResponse
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, NumericAnswerFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory, \
    DistributionPlanNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import NumericQuestionFactory, MultipleChoiceQuestionFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class DistributionPlanNodeTest(TestCase):
    def setUp(self):
        self.node = DistributionPlanNode()

    def test_should_have_all_expected_fields(self):
        fields = self.node._meta._name_map

        self.assertEqual(len(self.node._meta.fields), 8)
        for field in ['parent', 'distribution_plan', 'consignee', 'tree_position', 'location', 'mode_of_delivery',
                      'contact_person_id']:
            self.assertIn(field, fields)

    @patch('requests.get')
    def test_should_build_contact_with_details_from_contacts_service(self, mock_get):
        contact_id = '54335c56b3ae9d92f038abb0'
        fake_contact_json = {'firstName': "test", 'lastName': "user1", 'phone': "+256 782 443439", '_id': contact_id}
        fake_response = FakeResponse(fake_contact_json, 200)
        node = NodeFactory(contact_person_id=contact_id)
        mock_get.return_value = fake_response

        contact = node.build_contact()

        self.assertEqual(contact, fake_contact_json)
        mock_get.assert_called_with("%s%s/" % (settings.CONTACTS_SERVICE_URL, contact_id))

    def test_gets_all_response_for_node_consignee(self):
        multichoice_question = MultipleChoiceQuestionFactory(label='productReceived')
        yes_option = OptionFactory(text='Yes', question=multichoice_question)
        no_option = OptionFactory(text='No', question=multichoice_question)

        sugar = ItemFactory(description='Sugar')
        salt = ItemFactory(description='Salt')

        numeric_question = NumericQuestionFactory(label='AmountReceived')

        node = DistributionPlanNodeFactory()
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

        multiple_answer_two = MultipleChoiceAnswerFactory(line_item_run=sugar_line_item_run,
                                                          question=multichoice_question, value=no_option)
        numeric_answer_two = NumericAnswerFactory(line_item_run=sugar_line_item_run, value=80,
                                                  question=numeric_question)
        node_responses = node.responses()

        self.assertIn(multiple_answer_one, node_responses[line_item_run])
        self.assertIn(numeric_answer_one, node_responses[line_item_run])

        self.assertIn(multiple_answer_two, node_responses[sugar_line_item_run])
        self.assertIn(numeric_answer_two, node_responses[sugar_line_item_run])
