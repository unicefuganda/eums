import logging
from datetime import date

from eums.models import Question, DistributionPlan, Runnable, Programme, Consignee, DistributionPlanNode, Flow
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'ip-feedback-report-by-delivery'

logger = logging.getLogger(__name__)

CONTACT_PERSON_ID = '56494e2e1486bd312e4b2f31'


class IpFeedBackReportByDeliveryEndpointTest(AuthenticatedAPITestCase):
    def test_consignee_see_only_his_deliveries(self):
        consignee = ConsigneeFactory()
        self.logout()
        self.log_consignee_in(consignee)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.data['results']), 0)

    def test_should_return_delivery_answers(self):
        self._create_questions()
        programme_name = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        order_number = 34230305
        comment = 'Not Satisfied!!'
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, order_number, programme_name, wakiso, comment, True, True)

        programme = Programme.objects.get(name=programme_name)
        consignee = Consignee.objects.get(name=wakiso)

        yes = 'Yes'
        no = 'No'
        expected_response = [{'deliveryReceived': yes, 'shipmentDate': date(2015, 3, 10), 'dateOfReceipt': '12/03/2015',
                              'orderNumber': order_number, 'programme': {'id': programme.id, 'name': programme.name},
                              'consignee': {'id': consignee.id, 'name': consignee.name},
                              Question.LABEL.isDeliveryInGoodOrder: yes, 'satisfiedWithDelivery': no,
                              'urls': [],
                              'additionalDeliveryComments': comment, 'contactPersonId': CONTACT_PERSON_ID, 'value': 100,
                              'location': 'Madagascar'}]

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], expected_response)

    def test_should_return_ip_ids_and_programme_ids_with_delivery_answers(self):
        self._create_questions()
        programme_one = 'YP104 MANAGEMENT RESULTS'
        programme_two = 'Save the Mothers'
        wakiso = 'WAKISO DHO'
        napak = 'NAPAK DHO'
        order_number_one = 34230305
        order_number_two = 34230310
        comment = 'Not Satisfied!!'
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, order_number_one, programme_one, wakiso, comment, True, True)
        self.create_node_and_answers(number_of_deliveries, order_number_two, programme_two, napak, comment, True, True)

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['ipIds']), 2)
        self.assertEqual(len(response.data['programmeIds']), 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_should_return_delivery_empty_value_if_no_answers(self):
        self._create_questions()
        programme_name = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        shipment_date = date(2015, 3, 10)
        delivery = DeliveryFactory(contact_person_id=CONTACT_PERSON_ID,
                                   track=True, programme=ProgrammeFactory(name=programme_name),
                                   consignee=ConsigneeFactory(name=wakiso), delivery_date=shipment_date)
        order_number = 34230335
        DeliveryNodeFactory(contact_person_id=CONTACT_PERSON_ID, distribution_plan=delivery, track=True,
                            tree_position=Flow.Label.IMPLEMENTING_PARTNER,
                            item=PurchaseOrderItemFactory(
                                    purchase_order=PurchaseOrderFactory(order_number=order_number)))
        run = RunFactory(runnable=delivery)

        MultipleChoiceAnswerFactory(run=run, question=self.delivery_received_qtn, value=self.yes_one)
        MultipleChoiceAnswerFactory(run=run, question=self.satisfied_with_delivery, value=self.no_three)

        programme = Programme.objects.get(name=programme_name)
        consignee = Consignee.objects.get(name=wakiso)

        yes = 'Yes'
        no = 'No'
        empty = ''
        expected_response = [{'deliveryReceived': yes, 'shipmentDate': date(2015, 3, 10), 'dateOfReceipt': empty,
                              'orderNumber': order_number, 'programme': {'id': programme.id, 'name': programme.name},
                              'consignee': {'id': consignee.id, 'name': consignee.name},
                              Question.LABEL.isDeliveryInGoodOrder: empty, 'satisfiedWithDelivery': no,
                              'urls': [],
                              'additionalDeliveryComments': empty, 'contactPersonId': CONTACT_PERSON_ID,
                              'value': 100, 'location': 'Kampala'}]

        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], expected_response)

    def test_should_return_delivery_answers_for_tracked_deliveries_and_nodes(self):
        self._create_questions()
        programme_one = 'YP104 MANAGEMENT RESULTS'
        programme_two = 'Save the Mothers'
        wakiso = 'WAKISO DHO'
        napak = 'NAPAK DHO'
        order_number = 34230305
        comment = 'Not Satisfied!!'
        number_of_deliveries = 1

        self.create_node_and_answers(number_of_deliveries, order_number, programme_one, wakiso,
                                     comment, True, True)

        DeliveryNodeFactory()
        self.create_node_and_answers(number_of_deliveries, 57848383, programme_two, napak, comment, True, False)

        programme = Programme.objects.get(name=programme_one)
        consignee = Consignee.objects.get(name=wakiso)

        yes = 'Yes'
        no = 'No'
        expected_response = [{'deliveryReceived': yes, 'shipmentDate': date(2015, 3, 10), 'dateOfReceipt': '12/03/2015',
                              'orderNumber': order_number, 'programme': {'id': programme.id, 'name': programme.name},
                              'consignee': {'id': consignee.id, 'name': consignee.name},
                              Question.LABEL.isDeliveryInGoodOrder: yes, 'satisfiedWithDelivery': no,
                              'urls': [],
                              'additionalDeliveryComments': comment,
                              'contactPersonId': CONTACT_PERSON_ID,
                              'value': 100, 'location': 'Madagascar'}]
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results, expected_response)

    def test_should_not_return_delivery_answers_for_end_users(self):
        self._create_questions()
        programme_one = 'YP104 MANAGEMENT RESULTS'
        programme_two = 'Save the Mothers'
        wakiso = 'WAKISO DHO'
        napak = 'NAPAK DHO'
        order_number = 34230305
        comment = 'Not Satisfied!!'
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, order_number, programme_one, wakiso, comment, True, True)

        self.create_node_and_answers(number_of_deliveries, 57848383, programme_two, napak, comment, True, True,
                                     tree_position=Flow.Label.END_USER)

        programme = Programme.objects.get(name=programme_one)
        consignee = Consignee.objects.get(name=wakiso)

        yes = 'Yes'
        no = 'No'
        expected_response = [{'deliveryReceived': yes, 'shipmentDate': date(2015, 3, 10), 'dateOfReceipt': '12/03/2015',
                              'orderNumber': order_number, 'programme': {'id': programme.id, 'name': programme.name},
                              'consignee': {'id': consignee.id, 'name': consignee.name},
                              Question.LABEL.isDeliveryInGoodOrder: yes, 'satisfiedWithDelivery': no,
                              'urls': [],
                              'additionalDeliveryComments': comment, 'contactPersonId': CONTACT_PERSON_ID,
                              'value': 100, 'location': 'Madagascar'}]
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results, expected_response)

    def test_should_not_return_delivery_answers_for_middle_man(self):
        self._create_questions()
        programme_one = 'YP104 MANAGEMENT RESULTS'
        programme_two = 'Save the Mothers'
        wakiso = 'WAKISO DHO'
        napak = 'NAPAK DHO'
        order_number = 34230305
        comment = 'Not Satisfied!!'
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, order_number, programme_one, wakiso, comment, True, True)

        self.create_node_and_answers(number_of_deliveries, 57848383, programme_two, napak, comment, True, True,
                                     tree_position=Flow.Label.MIDDLE_MAN)

        programme = Programme.objects.get(name=programme_one)
        consignee = Consignee.objects.get(name=wakiso)

        yes = 'Yes'
        no = 'No'
        expected_response = [{'deliveryReceived': yes, 'shipmentDate': date(2015, 3, 10), 'dateOfReceipt': '12/03/2015',
                              'orderNumber': order_number, 'programme': {'id': programme.id, 'name': programme.name},
                              'consignee': {'id': consignee.id, 'name': consignee.name},
                              Question.LABEL.isDeliveryInGoodOrder: yes, 'satisfiedWithDelivery': no,
                              'urls': [],
                              'additionalDeliveryComments': comment, 'contactPersonId': CONTACT_PERSON_ID, 'value': 100,
                              'location': 'Madagascar'}]
        response = self.client.get(ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results, expected_response)

    def test_should_return_paginated_answers(self):
        self._create_questions()
        programme_name = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        order_number = 34230305
        comment = 'Satisfied!!'
        number_of_deliveries = 20
        self.create_node_and_answers(number_of_deliveries, order_number, programme_name, wakiso, comment, False, True)

        response = self.client.get(ENDPOINT_URL, content_type='application/json')

        self.assertEqual(len(response.data['results']), 10)
        self.assertIn('/api/ip-feedback-report-by-delivery?page=2', response.data['next'])
        self.assertEqual(response.data['previous'], None)
        self.assertEqual(response.data['count'], number_of_deliveries)
        self.assertEqual(response.data['pageSize'], 10)

        response = self.client.get(ENDPOINT_URL + '?page=2', content_type='application/json')

        self.assertEqual(len(response.data['results']), 10)
        self.assertEqual(response.data['next'], None)
        self.assertIn('/api/ip-feedback-report-by-delivery?page=1', response.data['previous'])
        self.assertEqual(response.data['count'], number_of_deliveries)
        self.assertEqual(response.data['pageSize'], 10)

    def test_should_filter_answers_by_programme(self):
        self._create_questions()
        number_of_deliveries = 1
        management_results = 'YP104 MANAGEMENT RESULTS'
        self.create_node_and_answers(number_of_deliveries, 34230305, management_results, 'WAKISO DHO',
                                     'Satisfied!!', False, True)
        programme = Programme.objects.get(name=management_results)

        self.create_node_and_answers(number_of_deliveries, 34230343, management_results, 'WAKISO DHO',
                                     'Satisfied!!', False, False)
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, 34230356, 'THE MANAGEMENT RESULTS', 'KOBOKO DHO',
                                     'Not Satisfied!!', True, True)

        response = self.client.get(ENDPOINT_URL + '?programme_id=%s' % programme.id, content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['programme']['name'], management_results)

    def test_should_filter_answers_by_location(self):
        self._create_questions()
        number_of_deliveries = 1
        management_results = 'YP104 MANAGEMENT RESULTS'
        self.create_node_and_answers(number_of_deliveries, 34230305, management_results, 'WAKISO DHO',
                                     'Satisfied!!', False, False)

        location = 'Fort Portal'
        self.create_node_and_answers(number_of_deliveries, 34230343, management_results, 'WAKISO DHO',
                                     'Satisfied!!', False, True, location=location)
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, 34230356, 'THE MANAGEMENT RESULTS', 'KOBOKO DHO',
                                     'Not Satisfied!!', True, True)

        response = self.client.get(ENDPOINT_URL + '?location=%s' % location, content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['location'], location)

    def test_filter_by_location_should_give_everything_if_empty(self):
        self._create_questions()
        number_of_deliveries = 1
        management_results = 'YP104 MANAGEMENT RESULTS'
        self.create_node_and_answers(number_of_deliveries, 34230305, management_results, 'WAKISO DHO',
                                     'Satisfied!!', False, False)

        location = 'Fort Portal'
        self.create_node_and_answers(number_of_deliveries, 34230343, management_results, 'WAKISO DHO',
                                     'Satisfied!!', False, True, location=location)
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, 34230356, 'THE MANAGEMENT RESULTS', 'KOBOKO DHO',
                                     'Not Satisfied!!', True, True)

        response = self.client.get(ENDPOINT_URL + '?location=', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 2)
        locations = [result['location'] for result in results]
        self.assertIn(location, locations)
        self.assertIn('Madagascar', locations)

    def test_should_filter_answers_by_implementing_partner(self):
        self._create_questions()
        number_of_deliveries = 1
        management_results = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        self.create_node_and_answers(number_of_deliveries, 34230305, management_results, wakiso,
                                     'Satisfied!!', False, True)
        consignee = Consignee.objects.get(name=wakiso)
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, 34230356, 'THE MANAGEMENT RESULTS', 'KOBOKO DHO',
                                     'Not Satisfied!!', True, True)

        response = self.client.get(ENDPOINT_URL + '?consignee_id=%s' % consignee.id, content_type='application/json')
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['consignee']['name'], wakiso)

    def test_should_filter_answers_by_purchase_order(self):
        self._create_questions()
        number_of_deliveries = 1
        management_results = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        order_number = 34230305
        self.create_node_and_answers(number_of_deliveries, order_number, management_results, wakiso,
                                     'Satisfied!!', True, True)
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, 34230356, 'THE MANAGEMENT RESULTS', 'KOBOKO DHO',
                                     'Not Satisfied!!', False, True)

        response = self.client.get(ENDPOINT_URL + '?po_waybill=34230305', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['orderNumber'], order_number)

    def test_should_filter_answers_by_waybill(self):
        self._create_questions()
        number_of_deliveries = 1
        management_results = 'YP104 MANAGEMENT RESULTS'
        wakiso = 'WAKISO DHO'
        order_number = 34230356
        self.create_node_and_answers(number_of_deliveries, 34230305, management_results, wakiso,
                                     'Satisfied!!', True, True)
        number_of_deliveries = 1
        self.create_node_and_answers(number_of_deliveries, order_number, 'THE MANAGEMENT RESULTS', 'KOBOKO DHO',
                                     'Not Satisfied!!', False, True)

        response = self.client.get(ENDPOINT_URL + '?po_waybill=34230356', content_type='application/json')

        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['orderNumber'], order_number)

    def test_should_filter_answers_by_received(self):
        self._setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?received=Yes', content_type='application/json')
        results = response.data['results']
        self.assertEqual(len(results), 2)

        response = self.client.get(ENDPOINT_URL + '?received=No', content_type='application/json')
        results = response.data['results']
        self.assertEqual(len(results), 1)

    def test_should_filter_answer_by_satisfied(self):
        self._setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?satisfied=Yes', content_type='application/json')
        results = response.data['results']
        self.assertEqual(len(results), 2)

        response = self.client.get(ENDPOINT_URL + '?satisfied=No', content_type='application/json')
        results = response.data['results']
        self.assertEqual(len(results), 1)

    def test_should_filter_answer_by_condition(self):
        self._setup_nodes_with_answers()

        response = self.client.get(ENDPOINT_URL + '?good_condition=Yes', content_type='application/json')
        results = response.data['results']
        self.assertEqual(len(results), 1)

        response = self.client.get(ENDPOINT_URL + '?good_condition=No', content_type='application/json')
        results = response.data['results']
        self.assertEqual(len(results), 2)

    def _create_questions(self):
        flow = FlowFactory(label='IMPLEMENTING_PARTNER')

        self.delivery_received_qtn = MultipleChoiceQuestionFactory(text='Was delivery received?', flow=flow,
                                                                   position=1,
                                                                   label=Question.LABEL.deliveryReceived)
        self.yes_one = OptionFactory(text='Yes', question=self.delivery_received_qtn)
        self.no_one = OptionFactory(text='No', question=self.delivery_received_qtn)

        self.date_received_qtn = TextQuestionFactory(text='When was delivery received?', flow=flow, position=2,
                                                     label='dateOfReceipt')

        self.delivery_in_good_order = MultipleChoiceQuestionFactory(text='Was delivery in good condition?',
                                                                    flow=flow, position=3,
                                                                    label=Question.LABEL.isDeliveryInGoodOrder)
        self.yes_two = OptionFactory(text='Yes', question=self.delivery_in_good_order)
        self.no_two = OptionFactory(text='No', question=self.delivery_in_good_order)

        self.satisfied_with_delivery = MultipleChoiceQuestionFactory(text="Are you satisfied with the delivery?",
                                                                     flow=flow, position=4,
                                                                     label="satisfiedWithDelivery")
        self.yes_three = OptionFactory(text="Yes", question=self.satisfied_with_delivery)
        self.no_three = OptionFactory(text="No", question=self.satisfied_with_delivery)

        self.additional_comments = TextQuestionFactory(text='Additional Remarks', flow=flow, position=5,
                                                       label='additionalDeliveryComments')

    def _create_node(self, delivery, is_purchase, order_number, track, tree_position, location='Madagascar'):
        if is_purchase:
            DeliveryNodeFactory(
                    track=track, distribution_plan=delivery, tree_position=tree_position, location=location,
                    item=PurchaseOrderItemFactory(purchase_order=PurchaseOrderFactory(order_number=order_number)))
        else:
            DeliveryNodeFactory(
                    track=track, distribution_plan=delivery, tree_position=tree_position, location=location,
                    item=ReleaseOrderItemFactory(release_order=ReleaseOrderFactory(waybill=order_number)))

    def create_node_and_answers(self, number_of_deliveries, order_number, programme_name, consignee, comment,
                                is_purchase, track, tree_position=Flow.Label.IMPLEMENTING_PARTNER,
                                location='Madagascar', contact_person_id=CONTACT_PERSON_ID):
        while number_of_deliveries > 0:
            delivery = DeliveryFactory(contact_person_id=contact_person_id,
                                       track=track, programme=ProgrammeFactory(name=programme_name),
                                       consignee=ConsigneeFactory(name=consignee), delivery_date=date(2015, 3,
                                                                                                      10),
                                       location=location)

            self._create_node(delivery, is_purchase, order_number, track, tree_position, location)

            run = RunFactory(runnable=delivery)
            MultipleChoiceAnswerFactory(run=run, question=self.delivery_received_qtn, value=self.yes_one)
            delivery_date = '12/03/2015'
            TextAnswerFactory(run=run, question=self.date_received_qtn, value=delivery_date)
            MultipleChoiceAnswerFactory(run=run, question=self.delivery_in_good_order, value=self.yes_two)
            MultipleChoiceAnswerFactory(run=run, question=self.satisfied_with_delivery, value=self.no_three)
            TextAnswerFactory(run=run, question=self.additional_comments, value=comment)
            number_of_deliveries -= 1
            order_number += 1

    # The testing data below are only used for filters 'received', 'satisfied', 'condition'
    # Refactor all testing data if needed
    def _setup_nodes_with_answers(self):
        self._create_questions()

        programme_one = ProgrammeFactory(name='programme one')
        programme_two = ProgrammeFactory(name='programme two')
        programme_three = ProgrammeFactory(name='programme three')
        delivery_one = DeliveryFactory(track=True, programme=programme_one, delivery_date=date(2015, 3, 10),
                                       location='Wakiso')
        delivery_two = DeliveryFactory(track=True, programme=programme_two, delivery_date=date(2015, 6, 20),
                                       location='Kampala')
        delivery_three = DeliveryFactory(track=True, programme=programme_three, delivery_date=date(2015, 9, 30),
                                         location='Fort portal')

        DeliveryNodeFactory(distribution_plan=delivery_one, programme=programme_one,
                            tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(distribution_plan=delivery_two, programme=programme_two,
                            tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(distribution_plan=delivery_three, programme=programme_two,
                            tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)

        run_one = RunFactory(runnable=delivery_one)
        MultipleChoiceAnswerFactory(run=run_one, question=self.delivery_received_qtn, value=self.yes_one)
        MultipleChoiceAnswerFactory(run=run_one, question=self.delivery_in_good_order, value=self.no_two)
        MultipleChoiceAnswerFactory(run=run_one, question=self.satisfied_with_delivery, value=self.no_three)

        run_two = RunFactory(runnable=delivery_two)
        MultipleChoiceAnswerFactory(run=run_two, question=self.delivery_received_qtn, value=self.no_one)
        MultipleChoiceAnswerFactory(run=run_two, question=self.delivery_in_good_order, value=self.yes_two)
        MultipleChoiceAnswerFactory(run=run_two, question=self.satisfied_with_delivery, value=self.yes_three)

        run_three = RunFactory(runnable=delivery_three)
        MultipleChoiceAnswerFactory(run=run_three, question=self.delivery_received_qtn, value=self.yes_one)
        MultipleChoiceAnswerFactory(run=run_three, question=self.delivery_in_good_order, value=self.no_two)
        MultipleChoiceAnswerFactory(run=run_three, question=self.satisfied_with_delivery, value=self.yes_three)
