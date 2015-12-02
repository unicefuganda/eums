from eums.services.exporter.feedback_report_csv_exporter import FeedbackReportExporter


class DeliveryFeedbackReportExporter(FeedbackReportExporter):
    HEADER_DIC_KEY_MAP = {'RECEIVED': 'deliveryReceived', 'SHIPMENT_DATE': 'shipmentDate',
                          'DATE_RECEIVED': 'dateOfReceipt',
                          'PO/WAYBILL': 'orderNumber', 'OUTCOME': 'programme.name',
                          'IMPLEMENTING_PARTNER': 'consignee.name',
                          'VALUE': 'value', 'CONDITION': 'isDeliveryInGoodOrder', 'SATISFIED': 'satisfiedWithDelivery',
                          'REMARKS': 'additionalDeliveryComments'}

    def __init__(self, host_name):
        self.export_label = 'Delivery Feedback Report'
        self.file_name = 'deliveries_feedback_report'
        super(DeliveryFeedbackReportExporter, self).__init__(host_name)

    def init_header_dic_key_map(self):
        return self.HEADER_DIC_KEY_MAP
