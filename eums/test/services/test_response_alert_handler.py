from unittest import TestCase
from eums.models import Alert, Question
from eums.services.response_alert_handler import ResponseAlertHandler
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory


class ResponseAlertHandlerTest(TestCase):

    def tearDown(self):
        Alert.objects.all().delete()

    def test_should_create_alert_when_delivery_is_not_in_good_condition(self):
        answer_values = [
            {"category": {"base": "Yes"}, "label": Question.LABEL.deliveryReceived},
            {"category": {"base": "No"}, "label": Question.LABEL.isDeliveryInGoodOrder}
        ]
        purchase_order = PurchaseOrderFactory(order_number=1234)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Arsenal FC")
        delivery = DeliveryFactory(consignee=consignee)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        alert = Alert.objects.get(consignee_name="Arsenal FC", order_number=1234)
        self.assertEqual(alert.issue, Alert.ISSUE_TYPES.bad_condition)

    def test_should_create_alert_when_delivery_is_not_received(self):
        answer_values = [
            {"category": {"base": "No"}, "label": Question.LABEL.deliveryReceived}
        ]
        purchase_order = PurchaseOrderFactory(order_number=5678)
        purchase_order_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        consignee = ConsigneeFactory(name="Liverpool FC")
        delivery = DeliveryFactory(consignee=consignee)
        DeliveryNodeFactory(item=purchase_order_item, distribution_plan=delivery)

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        alert = Alert.objects.get(consignee_name="Liverpool FC", order_number=5678)
        self.assertEqual(alert.issue, Alert.ISSUE_TYPES.not_received)

    def test_should_not_create_alert_when_no_issues_with_delivery(self):
        answer_values = [
            {"category": {"base": "Yes"}, "label": Question.LABEL.deliveryReceived},
            {"category": {"base": "Yes"}, "label": Question.LABEL.isDeliveryInGoodOrder}
        ]
        delivery = DeliveryFactory()

        response_alert_handler = ResponseAlertHandler(runnable=delivery, answer_values=answer_values)
        response_alert_handler.process()

        self.assertEqual(Alert.objects.count(), 0)
