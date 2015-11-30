# alerts
from eums.client.test.functional.fixtures.mapdata_deliveries import delivery_46, delivery_45
from eums.models import Alert, PurchaseOrderItem
from eums.test.factories.alert_factory import AlertFactory

AlertFactory(order_type=PurchaseOrderItem.PURCHASE_ORDER, order_number=12345, runnable=delivery_46)
AlertFactory(order_type=PurchaseOrderItem.PURCHASE_ORDER, order_number=654321,runnable=delivery_45, issue=Alert.ISSUE_TYPES.bad_condition,
             is_resolved=True)
