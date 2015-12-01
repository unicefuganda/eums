from eums.services.exporter.feedback_report_csv_exporter import FeedbackReportExporter


class DeliveryFeedbackReportExporter(FeedbackReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Delivery Feedback Report'
        self.export_filename = 'deliveries_feedback_report' + self.make_csv_suffix()
        super(DeliveryFeedbackReportExporter, self).__init__(host_name)

    def _init_header_dic_key_map(self):
        return {
            'RECEIVED': 'deliveryReceived',
            'SHIPMENT_DATE': 'shipmentDate',
            'DATE_RECEIVED': 'dateOfReceipt',
            'PO/WAYBILL': 'orderNumber',
            'OUTCOME': 'programme.name',
            'IMPLEMENTING_PARTNER': 'consignee.name',
            'VALUE': 'value',
            'CONDITION': 'isDeliveryInGoodOrder',
            'SATISFIED': 'satisfiedWithDelivery',
            'REMARKS': 'additionalDeliveryComments'
        }
