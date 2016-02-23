from eums.services.exporter.report_csv_exporter import ReportExporter


class StockReportExporter(ReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Stock Report'
        self.file_name = 'stocks_report'
        super(StockReportExporter, self).__init__(host_name)
    #
    def config_headers(self):
        return ['PO / WAYBILL', 'OUTCOME', 'LAST_SHIPMENT_DATE', 'LAST_RECEIVED_DATE', 'VALUE_RECEIVED',
                'VALUE_DISPENSED', 'VALUE LOST/DAMAGED', 'VALUE BALANCE', 'ITEM', 'DESCRIPTION', 'DISTRICT', 'IP', 'QUANTITY DELIVERED',
                'DATE SHIPPED', 'QUANTITY CONFIRMED', 'DATE CONFIRMED', 'QUANTITY DISPATCHED', 'QUANTITY LOST/DAMAGED', 'REMARK', 'QUANTITY BALANCE']

    def config_dic_date_keys(self):
        return ['document_number', 'programme', 'last_shipment_date', 'last_received_date', 'total_value_received',
                'total_value_dispensed', 'total_value_lost', 'balance', 'item.code', 'item.description', 'item.location', 'item.consignee',
                'item.quantity_delivered','item.date_delivered', 'item.quantity_confirmed', 'item.date_confirmed',
                'item.quantity_dispatched', 'item.quantity_lost', 'item.remark_lost', 'item.balance']

