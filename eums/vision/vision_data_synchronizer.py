import datetime
import re
from abc import ABCMeta, abstractmethod

import requests
from celery.utils.log import get_task_logger

from eums import settings

logger = get_task_logger(__name__)


class VisionException(Exception):
    def __init__(self, message=''):
        self.message = message

    def get_error_message(self):
        return self.message


class VisionDataSynchronizer:
    __metaclass__ = ABCMeta
    NO_DATA_MESSAGE = u'No Data Available'

    def __init__(self, url):
        if not url:
            raise VisionException(message='Url is required')

        self.url = url
        logger.info("Vision sync url:%s" % self.url)

    @abstractmethod
    def _convert_records(self, records):
        pass

    @abstractmethod
    def _save_records(self, records):
        pass

    @abstractmethod
    def _get_json(self, data):
        return []

    def _load_records(self):
        try:
            response = requests.get(self.url, headers={'Content-Type': 'application/json'},
                                    auth=(settings.VISION_USER, settings.VISION_PASSWORD),
                                    verify=False)
        except Exception:
            raise VisionException(message='Load data failed')

        if response.status_code != 200:
            raise VisionException(message=('Load data failed! Http code:%s' % response.status_code))

        return self._get_json(response.json())

    def sync(self):
        try:
            original_records = self._load_records()
            records = self._convert_records(original_records)
            self._save_records(records)
        except Exception, e:
            raise VisionException(message=e.message or 'Sync failed')

    @staticmethod
    def _convert_date_format(date_str):
        try:
            date_str = re.match(r'/Date\((\d+)\)/', date_str, re.I).group(1)
            return datetime.datetime.fromtimestamp(int(date_str) / 1000.0)
        except Exception:
            raise VisionException(message='Convert date failed')

    @staticmethod
    def _clean_value(value):
        parse_string = lambda x: x.isalpha() and x or x.isdigit() and int(x) \
                                 or re.match('(?i)^-?(\d+\.?e\d+|\d+\.\d*|\.\d+)$', x) and float(x) or x

        if type(value) == unicode:
            encoded_value = value.encode('ascii', 'ignore')
            value = parse_string(encoded_value)
            if type(value) == int:
                return value
            elif type(value) == str:
                return value.encode("'utf8'")
        else:
            return value

    @staticmethod
    def filter_relevant_value(mapping_template, data_dict):
        result = {}
        for key, value in data_dict.iteritems():
            if key in mapping_template.iterkeys():
                result[mapping_template[key]] = VisionDataSynchronizer._clean_value(value)
        return result
