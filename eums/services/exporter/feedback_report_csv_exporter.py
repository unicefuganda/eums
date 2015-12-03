import time
from eums.services.exporter.abstract_csv_exporter import AbstractCSVExporter


class FeedbackReportExporter(AbstractCSVExporter):
    KEY_HEADER = 'header'
    KEY_DIC_KEYS = 'dic_keys'

    def __init__(self, host_name):
        self.export_category = 'report/feedback'
        super(FeedbackReportExporter, self).__init__(host_name)

    def assemble_csv_data(self, deliveries_feedback_report):
        total_rows = [self.init_header_dic_key_map().get(self.KEY_HEADER)]
        for each_delivery_feedback_back in deliveries_feedback_report:
            total_rows.append(self.__extract_row(each_delivery_feedback_back))
        return total_rows

    def __extract_row(self, row_data):
        row_value = []
        for key in self.init_header_dic_key_map().get(self.KEY_DIC_KEYS):
            row_value.append(self.__extract_cell(row_data, key))
        return row_value

    def __extract_cell(self, row_data, key):
        if '.' not in key:
            return row_data.get(key)
        first_key = key[0:key.index('.')]
        rest_keys = key[key.index('.') + 1:len(key)]
        return self.__extract_cell(row_data.get(first_key), rest_keys) if row_data.get(first_key) else ''

    def init_header_dic_key_map(self):
        return {self.KEY_HEADER: self.config_headers(), self.KEY_DIC_KEYS: self.config_dic_date_keys()}

    def config_headers(self):
        return []

    def config_dic_date_keys(self):
        return []
