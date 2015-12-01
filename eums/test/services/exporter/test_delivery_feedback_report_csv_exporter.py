from unittest import TestCase

from django.db.backends.dummy.base import ignore

from eums.models import DistributionPlanNode, DistributionPlan
from eums.services.exporter.delivery_feedback_report_csv_exporter import DeliveryFeedbackReportExporter
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.release_order_factory import ReleaseOrderFactory
from eums.test.factories.release_order_item_factory import ReleaseOrderItemFactory


class DeliveryFeedbackReportExporterTest(TestCase):
    DELIVERY_FEEDBACK_REPORT_HEADER = ['RECEIVED', 'SHIPMENT_DATE', 'DATE_RECEIVED', 'PO/WAYBILL', 'OUTCOME',
                                       'IMPLEMENTING_PARTNER',
                                       'VALUE', 'CONDITION', 'SATISFIED', 'REMARKS']
    HOSTNAME = "http://ha.ha/"
    EMAIL_NOTIFICATION_CONTENT = "%s some content {0} other content {1}"

    def tearDown(self):
        DistributionPlan.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    @ignore
    def test_should_get_export_list_for_warehouse(self, mock_build_contact):
        received = 'Yes'
        shipment_date = '2015-09-06'
        date_received = '2015-09-06'
        po_waybill = 5404939
        outcome = ''
        ip = 'Wakiso'
        value = 19874.8
        condition = 'Good'
        satisfied = 'Yes'
        remark = 'It is a good delivery'

        delivery = DeliveryFactory()
        consignee_name = ip
        consignee = ConsigneeFactory(name=consignee_name)
        waybill = 5404939
        mama_kit = 'Mama kit'
        material_code = 'Code 30'
        ro_item = ReleaseOrderItemFactory(item=ItemFactory(description=mama_kit, material_code=material_code),
                                          release_order=ReleaseOrderFactory(waybill=waybill))

        DeliveryNodeFactory(distribution_plan=delivery, delivery_date=shipment_date,
                            consignee=consignee, item=ro_item, remark=remark)

        row_value = [received, shipment_date, date_received, po_waybill, outcome, ip, value, condition,
                     satisfied,
                     remark]
        expected_data = [self.DELIVERY_FEEDBACK_REPORT_HEADER, row_value]
        csv_exporter = DeliveryFeedbackReportExporter(self.HOSTNAME)

        self.assertEqual(csv_exporter.assemble_csv_data(), expected_data)
