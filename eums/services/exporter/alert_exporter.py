from eums.services.exporter.report_csv_exporter import ReportExporter


class AlertExporter(ReportExporter):
    def __init__(self, host_name):
        self.export_label = 'Alerts'
        self.file_name = 'Alerts'
        super(AlertExporter, self).__init__(host_name)

    def config_headers(self):
        return ['STATUS', 'ALERT DATE', 'PO/WAYBILL', 'DATE SHIPPED', 'VALUE', 'REPORTED BY',
                'IMPLEMENTING PARTNER', 'DISTRICT', 'UNICEF REMARKS']

    def config_dic_date_keys(self):
        return []
