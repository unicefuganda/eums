import datetime

from django.contrib.auth.models import Group, Permission

from eums.models import DistributionPlan as Delivery, Programme, Consignee, UserProfile
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DeliveryEndPointTest(AuthenticatedAPITestCase, PermissionsTestCase):

    @classmethod
    def setUpClass(cls):
        PermissionsTestCase.setUpClass()

    def setUp(self):
        super(DeliveryEndPointTest, self).setUp()
        self.clean_up()

    def tearDown(self):
        self.clean_up()

    def test_should_create_delivery(self):
        today = datetime.date.today()
        programme = ProgrammeFactory()
        delivery = DeliveryFactory(programme=programme, date=today)
        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], delivery.id)

    def _test_should_provide_delivery_total_value_from_api(self):
        po_item = PurchaseOrderItemFactory(value=200, quantity=100)
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=po_item, quantity=10)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.data[0]['total_value'], 20)

    def test_should_filter_deliveries_by_programme(self):
        programme = ProgrammeFactory()
        delivery = DeliveryFactory(programme=programme)
        DeliveryFactory()

        response = self.client.get('%s?programme=%d' % (ENDPOINT_URL, programme.id))

        self.assertEqual(Delivery.objects.count(), 2)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], delivery.id)

    def test_should_provide_delivery_is_received_value_from_api(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label='deliveryReceived')
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery)
        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.data[0]['is_received'], True)

    def test_should_filter_deliveries_by_ip(self):
        first_consignee = ConsigneeFactory()
        second_consignee = ConsigneeFactory()
        first_delivery = DeliveryFactory(consignee=first_consignee)
        second_delivery = DeliveryFactory(consignee=first_consignee)
        third_delivery = DeliveryFactory(consignee=second_consignee)

        self.logout()
        self.log_consignee_in(consignee=first_consignee)

        response = self.client.get(ENDPOINT_URL)

        ids = map(lambda delivery: delivery['id'], response.data)

        self.assertEqual(response.status_code, 200)
        self.assertIn(first_delivery.id, ids)
        self.assertIn(second_delivery.id, ids)
        self.assertNotIn(third_delivery.id, ids)

    def test_should_return_type_of_delivery(self):
        po_item = PurchaseOrderItemFactory()
        delivery = DeliveryFactory()
        DeliveryNodeFactory(distribution_plan=delivery, item=po_item)

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.data[0]['type'], 'Purchase Order')

    def clean_up(self):
        Programme.objects.all().delete()
        Consignee.objects.all().delete()
        UserProfile.objects.all().delete()
