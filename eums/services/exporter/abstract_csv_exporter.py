import os
import time
from django.conf import settings
from eums import export_settings
from eums.export_settings import CSV_EXPIRED_HOURS


class AbstractCSVExporter(object):
    def __init__(self, host_name):
        self.exported_csv_file_name = self.generate_exported_csv_file_name()
        self.csv_url = self._set_csv_url(host_name)
        AbstractCSVExporter.create_category_dir(self.export_category)

    def assemble_csv_data(self, data=None):
        return []

    def _set_csv_url(self, host_name):
        return '%sstatic/exports/%s/%s' % (host_name, self.export_category, self.exported_csv_file_name)

    def get_export_csv_file_name(self):
        return self.exported_csv_file_name

    def _message(self):
        return settings.EMAIL_NOTIFICATION_CONTENT.format(self.export_label, self.csv_url, CSV_EXPIRED_HOURS)

    def _subject(self):
        return "%s Download" % self.export_label

    def notification_details(self):
        return self._subject(), self._message()

    def generate_exported_csv_file_name(self):
        return self.file_name + '_' + str(int(round(time.time() * 1000))) + '.csv'

    @staticmethod
    def create_category_dir(category):
        target_dir = export_settings.EXPORTS_DIR + category
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
