from eums import settings_export
from eums.services.exporter.abstract_csv_exporter import AbstractCSVExporter


class ReportExporter(AbstractCSVExporter):
    def __init__(self, host_name):
        self.export_category = 'report/feedback'
        super(ReportExporter, self).__init__(host_name)

    def assemble_csv_data(self, report_data):
        total_rows = [self.config_headers()]
        for each_delivery_feedback_back in report_data:
            total_rows.append(self.__extract_row(each_delivery_feedback_back))
        return total_rows

    def __extract_row(self, row_data):
        row_value = []
        for key in self.config_dic_date_keys():
            row_value.append(self.__extract_cell(row_data, key))
        return row_value

    def __extract_cell(self, row_data, key):
        if '.' not in key:
            return row_data.get(key)
        first_key = key[0:key.index('.')]
        rest_keys = key[key.index('.') + 1:len(key)]
        return self.__extract_cell(row_data.get(first_key), rest_keys) if row_data.get(first_key) else ''

    def _subject(self):
        return settings_export.EMAIL_COMMON_SUBJECT

    def config_headers(self):
        return []

    def config_dic_date_keys(self):
        return []
