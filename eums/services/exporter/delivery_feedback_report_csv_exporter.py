import time
from eums.services.exporter.abstract_csv_exporter import AbstractCSVExporter


class DeliveryFeedbackReportExporter(AbstractCSVExporter):
    DELIVERY_FEEDBACK_REPORT_HEADER = ['RECEIVED', 'SHIPMENT_DATE', 'DATE_RECEIVED', 'PO/WAYBILL', 'OUTCOME',
                                       'IMPLEMENTING_PARTNER',
                                       'VALUE', 'CONDITION', 'SATISFIED', 'REMARKS']

    def __init__(self, host_name):
        self.export_label = 'Delivery Feedback Report'
        self.export_filename = 'deliveries_feedback_report' + self.make_csv_suffix()
        super(DeliveryFeedbackReportExporter, self).__init__(host_name)

    def _init_header(self):
        return self.DELIVERY_FEEDBACK_REPORT_HEADER

    def assemble_csv_data(self, deliveries_feedback_report):
        total_rows = [self.header]
        for each in deliveries_feedback_report:
            row_value = [each.get('deliveryReceived'), each.get('shipmentDate'), each.get('dateOfReceipt'),
                         each.get('orderNumber'),
                         each.get('programme')['name'], each.get('consignee')['name'], each.get('value'),
                         each.get('isDeliveryInGoodOrder'),
                         each.get('satisfiedWithDelivery'), each.get('additionalDeliveryComments')
                         ]
            total_rows.append(row_value)
        return total_rows
