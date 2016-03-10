from django.test import TestCase

from eums.models import Alert
from eums.services.alert_service import get_queryset
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


class AlertServiceTest(TestCase):
    def setUp(self):
        Alert.objects.all().delete()

        self.item_alert_1 = AlertFactory(order_number=81020737, runnable=DeliveryNodeFactory())
        self.item_alert_2 = AlertFactory(order_number=81035556, runnable=DeliveryNodeFactory())
        self.delivery_alert = AlertFactory(order_number=81025778, runnable=DeliveryFactory())
        self.distribution_alert = AlertFactory(order_number=81034568, runnable=DeliveryFactory(),
                                               issue=Alert.ISSUE_TYPES.distribution_expired)

    def test_should_get_all_alerts_by_type(self):
        alerts = get_queryset(Alert.ITEM, None)
        self.assertEqual(alerts.count(), 2)

        alerts = get_queryset(Alert.DELIVERY, None)
        self.assertEqual(alerts.count(), 1)
        self.assertEqual(alerts.first().order_number, self.delivery_alert.order_number)

        alerts = get_queryset(Alert.DISTRIBUTION, None)
        self.assertEqual(alerts.count(), 1)
        self.assertEqual(alerts.first().order_number, self.distribution_alert.order_number)

    def test_should_get_filtered_alerts(self):
        alerts = get_queryset(Alert.ITEM, self.item_alert_1.order_number)
        self.assertEqual(alerts.count(), 1)
        self.assertEqual(alerts.first().order_number, self.item_alert_1.order_number)

        alerts = get_queryset(Alert.ITEM, self.item_alert_2.order_number)
        self.assertEqual(alerts.count(), 1)
        self.assertEqual(alerts.first().order_number, self.item_alert_2.order_number)

        alerts = get_queryset(Alert.ITEM, 100000)
        self.assertEqual(alerts.count(), 0)
