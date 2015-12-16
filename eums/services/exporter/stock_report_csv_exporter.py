from eums.services.exporter.report_csv_exporter import ReportExporter


class StockReportExporter(ReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Stock Report'
        self.file_name = 'stocks_report'
        super(StockReportExporter, self).__init__(host_name)

    def config_headers(self):
        return ['PO / WAYBILL', 'OUTCOME', 'LAST_SHIPMENT_DATE', 'LAST_RECEIVED_DATE', 'VALUE_RECEIVED',
                'VALUE_DISPENSED', 'BALANCE']

    def config_dic_date_keys(self):
        return ['document_number', 'programme', 'last_shipment_date', 'last_received_date', 'total_value_received',
                'total_value_dispensed', 'balance']

