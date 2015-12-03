from eums.services.exporter.feedback_report_csv_exporter import FeedbackReportExporter


class DeliveryFeedbackReportExporter(FeedbackReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Delivery Feedback Report'
        self.file_name = 'deliveries_feedback_report'

        super(DeliveryFeedbackReportExporter, self).__init__(host_name)

    def config_headers(self):
        return ['RECEIVED', 'SHIPMENT_DATE', 'DATE_RECEIVED', 'PO/WAYBILL', 'OUTCOME', 'IMPLEMENTING_PARTNER', 'VALUE',
                'CONDITION', 'SATISFIED', 'REMARKS']

    def config_dic_date_keys(self):
        return ['deliveryReceived', 'shipmentDate', 'dateOfReceipt', 'orderNumber', 'programme.name', 'consignee.name',
                'value', 'isDeliveryInGoodOrder', 'satisfiedWithDelivery', 'additionalDeliveryComments']
