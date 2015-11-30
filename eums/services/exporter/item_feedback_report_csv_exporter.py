import time

from eums.services.exporter.abstract_csv_exporter import AbstractCSVExporter


class ItemFeedbackReportExporter(AbstractCSVExporter):
    ITEM_FEEDBACK_REPORT_HEADER = ['ITEM_DESCRIPTION', 'OUTCOME', 'IMPLEMENTING_PARTNER', 'LAST_RECIPIENT',
                                   'DISTRIBUTION_STAGE',
                                   'PO / WAYBILL', 'QUANTITY_SHIPPED', 'VALUE', 'RECEIVED', 'DATE_RECEIVED',
                                   'QUANTITY_RECEIVED',
                                   'QUALITY', 'SATISFIED', 'REMARKS']

    def __init__(self, host_name):
        self.export_label = 'ItemFeedbackReport'
        self.export_filename = 'items_feedback_report' + self.make_csv_suffix()
        super(ItemFeedbackReportExporter, self).__init__(host_name)

    def _init_header(self):
        return self.ITEM_FEEDBACK_REPORT_HEADER

    def assemble_csv_data(self, items_feedback_report):
        total_rows = [self.header]
        for each in items_feedback_report:
            row_value = [each.get('item_description'), each.get('programme'), each.get('implementing_partner'),
                         each.get('consignee'),
                         each.get('tree_position'), each.get('order_number'), each.get('quantity_shipped'),
                         each.get('value'),
                         each.get('itemReceived'), '', each.get('amountReceived'), each.get('qualityOfProduct'),
                         each.get('satisfiedWithProduct'), each.get('additionalDeliveryComments')
                         ]
            total_rows.append(row_value)
        return total_rows
