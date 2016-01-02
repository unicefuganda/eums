import datetime
from unittest import TestCase

from eums.vision.vision_data_converter import convert_vision_value


class TestVisionDataConverter(TestCase):
    def setUp(self):
        self.key = ''

    def test_should_convert_unicode_string_to_int(self):
        value = u'0020173918'
        self.assertEqual(convert_vision_value(self.key, value), 20173918)

    def test_should_convert_date_string_to_datetime(self):
        value = '/Date(1449118800000)/'
        self.assertEqual(convert_vision_value(self.key, value), datetime.datetime(2015, 12, 3, 8, 0))

    def test_should_convert_wbs_code(self):
        key = 'WBS_REFERENCE'
        value = '0060A007883001002'
        self.assertEqual(convert_vision_value(key, value), '0060/A0/07/883')

    def test_should_NOT_convert_common_str_or_digit(self):
        value = 'UNICEF-AFGHANISTAN-KABUL'
        self.assertEqual(convert_vision_value(self.key, value), 'UNICEF-AFGHANISTAN-KABUL')

        value = 3655.16
        self.assertEqual(convert_vision_value(self.key, value), 3655.16)

    def test_should_NOT_convert_empty_value(self):
        value = ''
        self.assertEqual(convert_vision_value(self.key, value), '')

        value = []
        self.assertEqual(convert_vision_value(self.key, value), [])
