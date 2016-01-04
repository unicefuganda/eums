import datetime
from unittest import TestCase

from eums.vision.vision_data_converter import convert_vision_value, format_records


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

    def test_should_format_order(self):
        orders = [{"SALES_ORDER_NO": u"0020173918",
                   "CREATE_DATE": u"/Date(1449118800000)/",
                   "UPDATE_DATE": u"/Date(1449378000000)/",
                   'WBS_REFERENCE': "0060A007883001002",
                   "SO_ITEM_NO": 80,
                   "SO_ITEM_DESC": "Scale,electronic,mother/child,150kgx100g",
                   "NET_VALUE": 51322.65},

                  {"SALES_ORDER_NO": u"0020173918",
                   "CREATE_DATE": u"/Date(1449118800000)/",
                   "UPDATE_DATE": u"/Date(1449378000000)/",
                   'WBS_REFERENCE': "0060A007883001002",
                   "SO_ITEM_NO": 90,
                   "SO_ITEM_DESC": "MUAC,Child 11.5 Red/PAC-50",
                   "NET_VALUE": 3655.16},

                  {"SALES_ORDER_NO": u"0020174363",
                   "CREATE_DATE": u"/Date(1450069200000)/",
                   "UPDATE_DATE": u"/Date(1450069200000)/",
                   'WBS_REFERENCE': '4380A004105007042',
                   "SO_ITEM_NO": 10,
                   "SO_ITEM_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                   "NET_VALUE": 2673}]

        formatted_orders = [{'SALES_ORDER_NO': u"0020173918",
                             'WBS_REFERENCE': "0060A007883001002",
                             'ITEMS': [{"SALES_ORDER_NO": u"0020173918",
                                        "CREATE_DATE": u"/Date(1449118800000)/",
                                        "UPDATE_DATE": u"/Date(1449378000000)/",
                                        'WBS_REFERENCE': "0060A007883001002",
                                        "SO_ITEM_NO": 80,
                                        "SO_ITEM_DESC": "Scale,electronic,mother/child,150kgx100g",
                                        "NET_VALUE": 51322.65},
                                       {"SALES_ORDER_NO": u"0020173918",
                                        "CREATE_DATE": u"/Date(1449118800000)/",
                                        "UPDATE_DATE": u"/Date(1449378000000)/",
                                        'WBS_REFERENCE': "0060A007883001002",
                                        "SO_ITEM_NO": 90,
                                        "SO_ITEM_DESC": "MUAC,Child 11.5 Red/PAC-50",
                                        "NET_VALUE": 3655.16}]},
                            {'SALES_ORDER_NO': u"0020174363",
                             'WBS_REFERENCE': '4380A004105007042',
                             'ITEMS': [{"SALES_ORDER_NO": u"0020174363",
                                        "CREATE_DATE": u"/Date(1450069200000)/",
                                        "UPDATE_DATE": u"/Date(1450069200000)/",
                                        'WBS_REFERENCE': '4380A004105007042',
                                        "SO_ITEM_NO": 10,
                                        "SO_ITEM_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                                        "NET_VALUE": 2673}]}]

        order_info = ('SALES_ORDER_NO', 'WBS_REFERENCE')
        self.assertEqual(format_records(orders, order_info), formatted_orders)
