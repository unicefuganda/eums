from eums.services.exporter.report_csv_exporter import ReportExporter


class DeliveryFeedbackReportExporter(ReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Delivery Feedback Report'
        self.file_name = 'deliveries_feedback_report'

        super(DeliveryFeedbackReportExporter, self).__init__(host_name)

    def config_headers(self):
        return ['RECEIVED', 'SHIPMENT_DATE', 'DATE_RECEIVED', 'PO/WAYBILL', 'OUTCOME', 'IMPLEMENTING_PARTNER',
                'CONTACT_NAME', 'CONTACT_PHONE', 'VALUE',
                'CONDITION', 'SATISFIED', 'REMARKS', 'PICTURES']

    def config_dic_date_keys(self):
        return ['deliveryReceived', 'shipmentDate', 'dateOfReceipt', 'orderNumber', 'programme.name', 'consignee.name',
                'contactName', 'contactPhone', 'value', 'isDeliveryInGoodOrder', 'satisfiedWithDelivery',
                'additionalDeliveryComments', 'urls']
