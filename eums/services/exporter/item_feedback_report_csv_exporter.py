from eums.services.exporter.report_csv_exporter import ReportExporter


class ItemFeedbackReportExporter(ReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Item Feedback Report'
        self.file_name = 'items_feedback_report'
        super(ItemFeedbackReportExporter, self).__init__(host_name)

    def config_headers(self):
        return ['ITEM_DESCRIPTION', 'OUTCOME', 'IMPLEMENTING_PARTNER', 'LAST_RECIPIENT', 'DISTRIBUTION_STAGE',
                'CONTACT_NAME', 'CONTACT_PHONE',
                'PO / WAYBILL', 'QUANTITY_SHIPPED', 'VALUE',
                'RECEIVED',
                'DATE_RECEIVED',
                'QUANTITY_RECEIVED',
                'QUALITY',
                'SATISFIED',
                'RECIPIENT REMARKS',
                'IP NOTES']

    def config_dic_date_keys(self):
        return ['item_description', 'programme.name', 'implementing_partner', 'consignee', 'tree_position',
                'contactName', 'contactPhone',
                'order_number', 'quantity_shipped', 'value',
                'answers.itemReceived.value',
                'mergedDateOfReceipt',
                'answers.amountReceived.value',
                'answers.qualityOfProduct.value',
                'answers.satisfiedWithProduct.value',
                'answers.additionalDeliveryComments.value',
                'additional_remarks']
