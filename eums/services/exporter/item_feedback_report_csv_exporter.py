from eums.services.exporter.feedback_report_csv_exporter import FeedbackReportExporter


class ItemFeedbackReportExporter(FeedbackReportExporter):
    HEADER_DIC_KEY_MAP = {'ITEM_DESCRIPTION': 'item_description', 'OUTCOME': 'programme.name',
                          'IMPLEMENTING_PARTNER': 'implementing_partner', 'LAST_RECIPIENT': 'consignee',
                          'DISTRIBUTION_STAGE': 'tree_position', 'PO / WAYBILL': 'order_number',
                          'QUANTITY_SHIPPED': 'quantity_shipped', 'VALUE': 'value', 'RECEIVED': 'answers.itemReceived',
                          'DATE_RECEIVED': 'answers.dateOfReceipt', 'QUANTITY_RECEIVED': 'amountReceived',
                          'QUALITY': 'qualityOfProduct', 'SATISFIED': 'satisfiedWithProduct',
                          'REMARKS': 'additionalDeliveryComments', }

    def __init__(self, host_name):
        self.export_label = 'Item Feedback Report'
        self.file_name = 'items_feedback_report'
        super(ItemFeedbackReportExporter, self).__init__(host_name)

    def init_header_dic_key_map(self):
        return self.HEADER_DIC_KEY_MAP
