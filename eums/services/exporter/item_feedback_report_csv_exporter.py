from eums.services.exporter.feedback_report_csv_exporter import FeedbackReportExporter


class ItemFeedbackReportExporter(FeedbackReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Item Feedback Report'
        self.file_name = 'items_feedback_report'
        super(ItemFeedbackReportExporter, self).__init__(host_name)

    def _init_header_dic_key_map(self):
        return {
            'ITEM_DESCRIPTION': 'item_description',
            'OUTCOME': 'programme',
            'IMPLEMENTING_PARTNER': 'implementing_partner',
            'LAST_RECIPIENT': 'consignee',
            'DISTRIBUTION_STAGE': 'tree_position',
            'PO / WAYBILL': 'order_number',
            'QUANTITY_SHIPPED': 'quantity_shipped',
            'VALUE': 'value',
            'RECEIVED': 'answers.productReceived',
            'DATE_RECEIVED': 'answers.dateOfReceipt',
            'QUANTITY_RECEIVED': 'amountReceived',
            'QUALITY': 'qualityOfProduct',
            'SATISFIED': 'satisfiedWithProduct',
            'REMARKS': 'additionalDeliveryComments',
        }
