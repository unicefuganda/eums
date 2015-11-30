import time
from django.conf import settings
from eums.models import ReleaseOrderItem, DistributionPlanNode, PurchaseOrderItem
from eums.services.abstract_csv_exporter import AbstractCSVExporter


class DeliveryFeedbackReportExport(AbstractCSVExporter):
    COMMON_HEADER = ['RECEIVED', 'SHIPMENT_DATE', 'DATE_RECEIVED', 'PO/WAYBILL', 'OUTCOME', 'IMPLEMENTING_PARTNER',
                     'VALUE', 'CONDITION', 'SATISFIED', 'REMARKS']

    def __init__(self, host_name):
        self.export_header = None
        self.export_label = 'DeliveryFeedbackReport'
        self.export_filename = 'deliveries_feedback_report_' + str(int(round(time.time() * 1000))) + '.csv'
        super(DeliveryFeedbackReportExport, self).__init__(host_name)

    def _init_header(self):
        return self.COMMON_HEADER

    def assemble_csv_data(self, deliveries_feedback_report):
        response_nodes = [self.header]
        for each in deliveries_feedback_report:
            row_value = [each.get('deliveryReceived'), each.get('shipmentDate'), each.get('dateOfReceipt'),
                         each.get('orderNumber'),
                         each.get('programme')['name'], each.get('consignee')['name'], each.get('value'),
                         each.get('isDeliveryInGoodOrder'),
                         each.get('satisfiedWithDelivery'), each.get('additionalDeliveryComments')
                         ]
            response_nodes.append(row_value)
        return response_nodes
