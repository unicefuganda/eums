from unittest import TestCase

from django.conf import settings
import requests_mock

from eums.models import Alert, Question, PurchaseOrder, Consignee, DistributionPlan, DistributionPlanNode
from eums.services.response_alert_handler import ResponseAlertHandler
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class ResponseAlertHandlerTest(TestCase):
    def tearDown(self):
        Alert.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        Consignee.objects.all().delete()
        DistributionPlan.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    @requests_mock.Mocker()
    def test_should_create_alert_when_delivery_is_not_in_good_condition(self, requests_mocker):
        answer_values = [
            {"category": {"base": "Yes"}, "label": Question.LABEL.deliveryReceived},
            {"category": {"base": "No"}, "label": Question.LABEL.isDeliveryInGoodOrder}
        ]
        purchase_order = PurchaseOrderFactory(order_number=1234)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Arsenal FC")
        delivery = DeliveryFactory(consignee=consignee)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        requests_mocker.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, delivery.contact_person_id), json={})

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        alert = Alert.objects.get(consignee_name="Arsenal FC", order_number=1234)
        self.assertEqual(alert.issue, Alert.ISSUE_TYPES.bad_condition)

    @requests_mock.Mocker()
    def test_should_create_alert_when_delivery_is_not_received(self, requests_mocker):
        answer_values = [
            {"category": {"base": "No"}, "label": Question.LABEL.deliveryReceived}
        ]
        purchase_order = PurchaseOrderFactory(order_number=5678)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Liverpool FC")
        delivery = DeliveryFactory(consignee=consignee)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        requests_mocker.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, delivery.contact_person_id), json={})

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        alert = Alert.objects.get(consignee_name="Liverpool FC", order_number=5678)
        self.assertEqual(alert.issue, Alert.ISSUE_TYPES.not_received)

    @requests_mock.Mocker()
    def test_should_create_alert_when_item_is_not_received(self, requests_mocker):
        answer_values = [
            {"category": {"base": "No"}, "label": Question.LABEL.itemReceived}
        ]
        purchase_order = PurchaseOrderFactory(order_number=5679)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Liverpool FC")
        delivery = DeliveryFactory(consignee=consignee)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        requests_mocker.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, delivery.contact_person_id), json={})

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        alert = Alert.objects.get(consignee_name="Liverpool FC", order_number=5679)
        self.assertEqual(alert.issue, Alert.ISSUE_TYPES.not_received)

    @requests_mock.Mocker()
    def test_should_create_alert_when_item_is_not_quality_acceptable(self, requests_mocker):
        answer_values = [
            {"category": {"base": "Damaged"}, "label": Question.LABEL.qualityOfProduct}
        ]
        purchase_order = PurchaseOrderFactory(order_number=5679)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Liverpool FC")
        delivery = DeliveryFactory(consignee=consignee)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        requests_mocker.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, delivery.contact_person_id), json={})

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        alert = Alert.objects.get(consignee_name="Liverpool FC", order_number=5679)
        self.assertEqual(alert.issue, "damaged")

    @requests_mock.Mocker()
    def test_should_fetch_name_from_contacts_and_adds_alert_attribute(self, requests_mocker):
        answer_values = [
            {"category": {"base": "No"}, "label": Question.LABEL.deliveryReceived},
            {"category": {"base": "Yes"}, "label": Question.LABEL.isDeliveryInGoodOrder}
        ]
        purchase_order = PurchaseOrderFactory(order_number=5678)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Liverpool FC")

        contact_person_id = 'some_id'
        contact = {u'_id': contact_person_id,
                   u'firstName': u'chris',
                   u'lastName': u'george',
                   u'phone': u'+256781111111'}

        delivery = DeliveryFactory(consignee=consignee, contact_person_id=contact_person_id)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        requests_mocker.get("%s%s/" % (settings.CONTACTS_SERVICE_URL, contact_person_id), json=contact)

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        alert = Alert.objects.get(consignee_name="Liverpool FC", order_number=5678)
        self.assertEqual(alert.contact_name, "chris george")

    def test_should_not_create_alert_when_no_issues_with_delivery(self):
        answer_values = [
            {"category": {"base": "Yes"}, "label": Question.LABEL.deliveryReceived},
            {"category": {"base": "Yes"}, "label": Question.LABEL.isDeliveryInGoodOrder}
        ]
        delivery = DeliveryFactory()

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        self.assertEqual(Alert.objects.count(), 0)

    def test_should_not_create_alert_when_non_delivery_question_are_answered_no(self):
        answer_values = [
            {"category": {"base": "No"}, "label": "This is not a delivery question"},
            {"category": {"base": "Yes"}, "label": Question.LABEL.isDeliveryInGoodOrder}
        ]
        delivery = DeliveryFactory()

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        self.assertEqual(Alert.objects.count(), 0)
