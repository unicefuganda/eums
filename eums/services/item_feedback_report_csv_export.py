import time
from django.conf import settings
from eums.models import ReleaseOrderItem, DistributionPlanNode, PurchaseOrderItem
from eums.services.abstract_csv_exporter import AbstractCSVExporter


class ItemFeedbackReportExport(AbstractCSVExporter):
    COMMON_HEADER = ['ITEM_DESCRIPTION', 'OUTCOME', 'IMPLEMENTING_PARTNER', 'LAST_RECIPIENT', 'DISTRIBUTION_STAGE',
                     'PO / WAYBILL', 'QUANTITY_SHIPPED', 'VALUE', 'RECEIVED', 'DATE_RECEIVED', 'QUANTITY_RECEIVED',
                     'QUALITY', 'SATISFIED', 'REMARKS']

    def __init__(self, host_name):
        self.export_header = None
        self.export_label = 'ItemFeedbackReport'
        self.export_filename = 'items_feedback_report_' + str(int(round(time.time() * 1000))) + '.csv'
        super(ItemFeedbackReportExport, self).__init__(host_name)

    def _init_header(self):
        return self.COMMON_HEADER

    def assemble_csv_data(self, items_feedback_report):
        response_nodes = [self.header]
        for each in items_feedback_report:
            row_value = [each.get('item_description'), each.get('programme'), each.get('implementing_partner'),
                         each.get('consignee'),
                         each.get('tree_position'), each.get('order_number'), each.get('quantity_shipped'),
                         each.get('value'),
                         each.get('itemReceived'), '', each.get('amountReceived'), each.get('qualityOfProduct'),
                         each.get('satisfiedWithProduct'), each.get('additionalDeliveryComments')
                         ]
            response_nodes.append(row_value)
        return response_nodes
