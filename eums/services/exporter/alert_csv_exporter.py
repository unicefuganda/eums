from eums import settings_export
from eums.models import Alert
from eums.services.exporter.abstract_csv_exporter import AbstractCSVExporter


class AlertCSVExporter(AbstractCSVExporter):
    def __init__(self, host_name, alert_type):
        self.export_category = 'alert'
        self.export_label = 'Alerts'
        self.file_name = 'Alerts_by_%s' % alert_type
        self.alert_type = alert_type
        super(AlertCSVExporter, self).__init__(host_name)

    def assemble_csv_data(self, alerts=None):
        total_rows = [self._init_header()]
        for alert in alerts:
            total_rows.append(self.__export_row_data(alert))
        return total_rows

    def __export_row_data(self, alert):
        reported_by = "%s\n%s" % (alert.contact['contact_name'], alert.contact['contact_phone'])

        keys = {Alert.ITEM: [alert.issue_display_name(), alert.created_on, alert.order_number, alert.date_shipped(),
                             alert.quantity_delivered(), alert.total_value(), alert.item_description, reported_by,
                             alert.consignee_name, alert.location(), alert.remarks, alert.is_resolved],

                Alert.DELIVERY: [alert.issue_display_name(), alert.created_on, alert.order_number, alert.date_shipped(),
                                 alert.total_value(), reported_by, alert.consignee_name, alert.location(),
                                 alert.remarks,
                                 alert.is_resolved, alert.is_retriggered()],

                Alert.DISTRIBUTION: [alert.created_on, alert.order_number, alert.date_shipped(), alert.date_received,
                                     alert.total_value(), reported_by, alert.consignee_name, alert.location(),
                                     alert.remarks, alert.is_resolved]}

        return keys.get(self.alert_type, [])

    def _subject(self):
        return settings_export.EMAIL_COMMON_SUBJECT

    def _init_header(self):
        headers = {Alert.ITEM: ['STATUS', 'ALERT DATE', 'PO/WAYBILL', 'DATE SHIPPED', 'QTY', 'VALUE', 'ITEM',
                                'REPORTED BY', 'IMPLEMENTING PARTNER', 'DISTRICT', 'UNICEF REMARKS', 'RESOLVE'],

                   Alert.DELIVERY: ['STATUS', 'ALERT DATE', 'PO/WAYBILL', 'DATE SHIPPED', 'VALUE', 'REPORTED BY',
                                    'IMPLEMENTING PARTNER', 'DISTRICT', 'UNICEF REMARKS', 'RESOLVE', 'RETRIGGER'],

                   Alert.DISTRIBUTION: ['DISTRIBUTION DEADLINE', 'PO/WAYBILL', 'DATE SHIPPED', 'DATE RECEIVED',
                                        'VALUE', 'REPORTED BY', 'IMPLEMENTING PARTNER', 'DISTRICT', 'UNICEF REMARKS',
                                        'RESOLVE']}

        return headers.get(self.alert_type, [])
