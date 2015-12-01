from abc import ABCMeta, abstractmethod
import time
from django.conf import settings


class AbstractCSVExporter(object):
    __metaclass__ = ABCMeta

    def __init__(self, host_name):
        self.header = self._set_export_header()
        self.csv_url = self._set_csv_url(host_name)

    @abstractmethod
    def _init_header(self):
        pass

    @abstractmethod
    def assemble_csv_data(self, data=None):
        pass

    def _set_csv_url(self, host_name):
        return '%sstatic/exports/%s' % (host_name, self.export_filename)

    def _set_export_header(self):
        header = []
        if self.export_header:
            header = [self.export_header]
        header.extend(self._init_header())
        return header

    def _message(self):
        return settings.EMAIL_NOTIFICATION_CONTENT.format(self.export_label, self.csv_url)

    def _subject(self):
        return "%s Download" % self.export_label

    def notification_details(self):
        return self._subject(), self._message()

    def make_csv_suffix(self):
        return '_' + str(int(round(time.time() * 1000))) + '.csv'
