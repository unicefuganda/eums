from unittest import TestCase
from django.test import override_settings
from mock import patch
from eums.models import DistributionPlanNode, PurchaseOrderItem, PurchaseOrder
from eums.services.exporter.delivery_csv_exporter import DeliveryCSVExporter
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory

HOSTNAME = "http://ha.ha/"
EMAIL_NOTIFICATION_CONTENT = "%s some content {0} other content {1}"


class DeliveryFeedbackReportExporterTest(TestCase):
    def tearDown(self):
        pass
