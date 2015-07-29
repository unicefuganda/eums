from eums.models import DistributionPlanNode
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import NumericAnswerFactory, MultipleChoiceAnswerFactory
from eums.test.factories.distribution_plan_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.run_factory import RunFactory

from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import NumericQuestionFactory, MultipleChoiceQuestionFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory

ENDPOINT_URL = BACKEND_URL + 'responses/'
NODE_ENDPOINT_URL = BACKEND_URL + 'node-responses/'
END_USER_ENDPOINT_URL = BACKEND_URL + 'end-user-responses/'


class ResponsesEndPointTest(AuthenticatedAPITestCase):
    def create_questions_and_items(self):
        self.multiple_choice_question_two = MultipleChoiceQuestionFactory(label='satisfiedWithProduct')
        self.multiple_choice_question = MultipleChoiceQuestionFactory(label='productReceived')

        self.yes_option = OptionFactory(text='Yes', question=self.multiple_choice_question)
        OptionFactory(text='No', question=self.multiple_choice_question)

        self.numeric_question = NumericQuestionFactory(label='amountReceived')

        salt = ItemFactory(description='Salt')
        self.item = SalesOrderItemFactory(item=salt, description='10 bags of salt')

    def create_nodes(self):
        self.ip_node = DeliveryNodeFactory()
        self.middle_man_node = DeliveryNodeFactory(parent=self.ip_node,
                                                           tree_position=DistributionPlanNode.MIDDLE_MAN,
                                                           distribution_plan=self.ip_node.distribution_plan,
                                                           targeted_quantity=100,
                                                           item=self.item)
        self.end_user_node = DeliveryNodeFactory(parent=self.middle_man_node,
                                                         tree_position=DistributionPlanNode.END_USER,
                                                         distribution_plan=self.ip_node.distribution_plan,
                                                         targeted_quantity=100,
                                                         item=self.item)

    def create_runs_and_answers(self):
        self.run_one = RunFactory(runnable=self.middle_man_node, status='completed')
        self.run_one_multiple_answer_one = MultipleChoiceAnswerFactory(run=self.run_one,
                                                                       question=self.multiple_choice_question,
                                                                       value=self.yes_option)
        self.run_one_multiple_answer_two = MultipleChoiceAnswerFactory(run=self.run_one,
                                                                       question=self.multiple_choice_question_two,
                                                                       value=self.yes_option)
        self.run_one_numeric_answer_one = NumericAnswerFactory(run=self.run_one, value=80,
                                                               question=self.numeric_question)

        self.run_two = RunFactory(runnable=self.end_user_node, status='completed')
        self.run_two_multiple_answer_one = MultipleChoiceAnswerFactory(run=self.run_two,
                                                                       question=self.multiple_choice_question,
                                                                       value=self.yes_option)
        self.run_two_multiple_answer_two = MultipleChoiceAnswerFactory(run=self.run_two,
                                                                       question=self.multiple_choice_question_two,
                                                                       value=self.yes_option)
        self.run_two_numeric_answer_one = NumericAnswerFactory(run=self.run_two, value=80,
                                                               question=self.numeric_question)

    def expected_response_data(self, node, consignee, programme, type):
        expected_data = {u'item': u'Salt', u'amountSent': 100, u'node': node.id,
                         u'consignee': {u'id': consignee.id, u'name': consignee.name,
                                        u'type': type},
                         u'ip': node.get_ip(),
                         u'%s' % self.numeric_question.label: u'%s' % self.run_one_numeric_answer_one.format(),
                         u'%s' % self.multiple_choice_question.label: u'%s' % self.run_one_multiple_answer_one.format(),
                         u'%s' % self.multiple_choice_question_two.label: u'%s' % self.run_one_multiple_answer_two.format(),
                         u'programme': {u'id': programme.id, u'name': programme.name},
                         u'location': node.location}
        return expected_data

    def test_should_provide_summary_data_from_node_response(self):
        self.create_questions_and_items()
        self.create_nodes()
        self.create_runs_and_answers()

        url = "%s%d/" % (ENDPOINT_URL, self.middle_man_node.consignee.id)
        response = self.client.get(url, format='json')
        consignee = self.middle_man_node.consignee
        programme = self.middle_man_node.distribution_plan.programme

        expected_data = self.expected_response_data(self.middle_man_node, consignee, programme,
                                                    DistributionPlanNode.MIDDLE_MAN)

        self.assertEqual(response.status_code, 200)
        self.assertEquals(expected_data, response.data[0])
        self.assertEquals(len(response.data), 1)
        self.assertDictContainsSubset(expected_data, response.data[0])

    def test_should_provide_summary_data_from_all_node_responses(self):
        self.create_questions_and_items()
        self.create_nodes()
        self.create_runs_and_answers()

        response = self.client.get(ENDPOINT_URL, format='json')
        consignee_one = self.middle_man_node.consignee
        consignee_two = self.end_user_node.consignee
        programme = self.middle_man_node.distribution_plan.programme

        expected_data_node_one = self.expected_response_data(self.middle_man_node, consignee_one, programme,
                                                             DistributionPlanNode.MIDDLE_MAN)
        expected_data_node_two = self.expected_response_data(self.end_user_node, consignee_two, programme,
                                                             DistributionPlanNode.END_USER)

        self.assertEqual(response.status_code, 200)
        self.assertEquals(len(response.data), 2)
        self.assertEquals(expected_data_node_one, response.data[0])
        self.assertEquals(expected_data_node_two, response.data[1])
        self.assertDictContainsSubset(expected_data_node_one, response.data[0])
        self.assertDictContainsSubset(expected_data_node_two, response.data[1])

    def test_should_provide_summary_data_from_all_end_user_node_responses(self):
        self.create_questions_and_items()
        self.create_nodes()
        self.create_runs_and_answers()

        response = self.client.get(END_USER_ENDPOINT_URL, format='json')
        consignee = self.end_user_node.consignee
        programme = self.middle_man_node.distribution_plan.programme

        expected_data_node = self.expected_response_data(self.end_user_node, consignee, programme,
                                                         DistributionPlanNode.END_USER)
        self.assertEqual(response.status_code, 200)
        self.assertEquals(len(response.data), 1)
        self.assertEquals(expected_data_node, response.data[0])
        self.assertDictContainsSubset(expected_data_node, response.data[0])

    def test_should_provide_summary_data_from_node_response_for_end_user(self):
        self.create_questions_and_items()
        self.create_nodes()
        self.create_runs_and_answers()

        url = "%s%d/" % (NODE_ENDPOINT_URL, self.end_user_node.id)
        response = self.client.get(url, format='json')

        expected_data = {
            "node": {
                "plan_id": self.end_user_node.distribution_plan.id,
                "contact_person_id": self.end_user_node.contact_person_id,
                "consignee": self.end_user_node.consignee.id,
                "id": self.end_user_node.id,
                "location": self.end_user_node.location
            },
            "run_id": self.run_two.id,
            "responses": {
                self.numeric_question.label: {
                    "id": self.run_two_numeric_answer_one.id,
                    "value": self.run_two_numeric_answer_one.value,
                    "formatted_value": self.run_two_numeric_answer_one.format()
                },
                self.multiple_choice_question.label: {
                    "id": self.run_two_multiple_answer_one.id,
                    "value": self.yes_option.id,
                    "formatted_value": self.run_two_multiple_answer_one.format()
                },
                self.multiple_choice_question_two.label: {
                    "id": self.run_two_multiple_answer_two.id,
                    "value": self.yes_option.id,
                    "formatted_value": self.run_two_multiple_answer_two.format()
                }
            }
        }

        self.assertEqual(response.status_code, 200)
        self.assertEquals(expected_data, response.data)
        self.assertDictContainsSubset(expected_data, response.data)

    def test_should_not_provide_summary_data_from_node_response_for_middleman_user(self):
        self.create_questions_and_items()
        self.create_nodes()
        self.create_runs_and_answers()

        url = "%s%d/" % (NODE_ENDPOINT_URL, self.run_one.id)
        response = self.client.get(url, format='json')

        expected_data = {}

        self.assertEqual(response.status_code, 200)
        self.assertEquals(expected_data, response.data)
        self.assertEquals(len(response.data), 0)
