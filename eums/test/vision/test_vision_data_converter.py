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
                   "DOCUMENT_TYPE": "ZCOM",
                   "DOCUMENT_DATE": u"/Date(1449118800000)/",
                   "CREATE_DATE": u"/Date(1449118800000)/",
                   "UPDATE_DATE": u"/Date(1449378000000)/",
                   "BUDGET_YEAR": 2015,
                   "SOLD_TO_PARTY": "Z00601",
                   "SOLD_TO_PARTY_DESCRIPTION": "UNICEF-AFGHANISTAN-KABUL",
                   "SHIP_TO_PARTY": "006",
                   "SHIP_TO_PARTY_DESCRIPTION": "Afghanistan",
                   "SO_ITEM_NO": 80,
                   "REQUISITION_NO": "0030344383",
                   "REQUISITION_ITEM_NO": 80,
                   "PURCHASING_GROUP_NAME_SHORT": "NUTRITION",
                   "WBS_REFERENCE": "0060A007883001002",
                   "GRANT_REF": "Unknown",
                   "GRANT_EXPIRY_DATE": None,
                   "DONOR_NAME": "UNICEF-AFGHANISTAN-KABUL",
                   "MATERIAL_CODE": "S0141021",
                   "MATERIAL_DESC": "Scale,electronic,mother/child,150kgx100g",
                   "SO_ITEM_DESC": "Scale,electronic,mother/child,150kgx100g",
                   "NET_VALUE": 51322.65},

                  {"SALES_ORDER_NO": u"0020173918",
                   "DOCUMENT_TYPE": "ZCOM",
                   "DOCUMENT_DATE": u"/Date(1449118800000)/",
                   "CREATE_DATE": u"/Date(1449118800000)/",
                   "UPDATE_DATE": u"/Date(1449378000000)/",
                   "BUDGET_YEAR": 2015, "SOLD_TO_PARTY": "Z00601",
                   "SOLD_TO_PARTY_DESCRIPTION": "UNICEF-AFGHANISTAN-KABUL",
                   "SHIP_TO_PARTY": "006",
                   "SHIP_TO_PARTY_DESCRIPTION": "Afghanistan",
                   "SO_ITEM_NO": 90,
                   "REQUISITION_NO": "0030344383",
                   "REQUISITION_ITEM_NO": 90,
                   "PURCHASING_GROUP_NAME_SHORT": "NUTRITION",
                   "WBS_REFERENCE": "0060A007883001002",
                   "GRANT_REF": "Unknown",
                   "GRANT_EXPIRY_DATE": None,
                   "DONOR_NAME": "UNICEF-AFGHANISTAN-KABUL",
                   "MATERIAL_CODE": "S0145620",
                   "MATERIAL_DESC": "MUAC,Child 11.5 Red/PAC-50",
                   "SO_ITEM_DESC": "MUAC,Child 11.5 Red/PAC-50",
                   "NET_VALUE": 3655.16},

                  {"SALES_ORDER_NO": u"0020174363",
                   "DOCUMENT_TYPE": "ZCOM",
                   "DOCUMENT_DATE": u"/Date(1450069200000)/",
                   "CREATE_DATE": u"/Date(1450069200000)/",
                   "UPDATE_DATE": u"/Date(1450069200000)/",
                   "BUDGET_YEAR": 2015,
                   "SOLD_TO_PARTY": "Z43801",
                   "SOLD_TO_PARTY_DESCRIPTION": "UNICEF-UGANDA-KAMPALA",
                   "SHIP_TO_PARTY": "438",
                   "SHIP_TO_PARTY_DESCRIPTION": "Uganda",
                   "SO_ITEM_NO": 10,
                   "REQUISITION_NO": "0030344855",
                   "REQUISITION_ITEM_NO": 10,
                   "PURCHASING_GROUP_NAME_SHORT": "Kampala, Uganda",
                   "WBS_REFERENCE": "4380A004105007042",
                   "GRANT_REF": "SM150377",
                   "GRANT_EXPIRY_DATE": u"/Date(1451538000000)/",
                   "DONOR_NAME": "UNICEF-UGANDA-KAMPALA",
                   "MATERIAL_CODE": "SL009100",
                   "MATERIAL_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                   "SO_ITEM_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                   "NET_VALUE": 2673}]

        formatted_orders = [{'SALES_ORDER_NO': u"0020173918",
                             'WBS_REFERENCE': "0060A007883001002",
                             'ITEMS': [{"SALES_ORDER_NO": u"0020173918",
                                        "DOCUMENT_TYPE": "ZCOM",
                                        "DOCUMENT_DATE": u"/Date(1449118800000)/",
                                        "CREATE_DATE": u"/Date(1449118800000)/",
                                        "UPDATE_DATE": u"/Date(1449378000000)/",
                                        "BUDGET_YEAR": 2015,
                                        "SOLD_TO_PARTY": "Z00601",
                                        "SOLD_TO_PARTY_DESCRIPTION": "UNICEF-AFGHANISTAN-KABUL",
                                        "SHIP_TO_PARTY": "006",
                                        "SHIP_TO_PARTY_DESCRIPTION": "Afghanistan",
                                        "SO_ITEM_NO": 80,
                                        "REQUISITION_NO": "0030344383",
                                        "REQUISITION_ITEM_NO": 80,
                                        "PURCHASING_GROUP_NAME_SHORT": "NUTRITION",
                                        "WBS_REFERENCE": "0060A007883001002",
                                        "GRANT_REF": "Unknown",
                                        "GRANT_EXPIRY_DATE": None,
                                        "DONOR_NAME": "UNICEF-AFGHANISTAN-KABUL",
                                        "MATERIAL_CODE": "S0141021",
                                        "MATERIAL_DESC": "Scale,electronic,mother/child,150kgx100g",
                                        "SO_ITEM_DESC": "Scale,electronic,mother/child,150kgx100g",
                                        "NET_VALUE": 51322.65},
                                       {"SALES_ORDER_NO": u"0020173918",
                                        "DOCUMENT_TYPE": "ZCOM",
                                        "DOCUMENT_DATE": u"/Date(1449118800000)/",
                                        "CREATE_DATE": u"/Date(1449118800000)/",
                                        "UPDATE_DATE": u"/Date(1449378000000)/",
                                        "BUDGET_YEAR": 2015, "SOLD_TO_PARTY": "Z00601",
                                        "SOLD_TO_PARTY_DESCRIPTION": "UNICEF-AFGHANISTAN-KABUL",
                                        "SHIP_TO_PARTY": "006",
                                        "SHIP_TO_PARTY_DESCRIPTION": "Afghanistan",
                                        "SO_ITEM_NO": 90,
                                        "REQUISITION_NO": "0030344383",
                                        "REQUISITION_ITEM_NO": 90,
                                        "PURCHASING_GROUP_NAME_SHORT": "NUTRITION",
                                        "WBS_REFERENCE": "0060A007883001002",
                                        "GRANT_REF": "Unknown",
                                        "GRANT_EXPIRY_DATE": None,
                                        "DONOR_NAME": "UNICEF-AFGHANISTAN-KABUL",
                                        "MATERIAL_CODE": "S0145620",
                                        "MATERIAL_DESC": "MUAC,Child 11.5 Red/PAC-50",
                                        "SO_ITEM_DESC": "MUAC,Child 11.5 Red/PAC-50",
                                        "NET_VALUE": 3655.16}]},
                           {'SALES_ORDER_NO': u"0020174363",
                            'WBS_REFERENCE': '4380A004105007042',
                            'ITEMS': [{"SALES_ORDER_NO": u"0020174363",
                                       "DOCUMENT_TYPE": "ZCOM",
                                       "DOCUMENT_DATE": u"/Date(1450069200000)/",
                                       "CREATE_DATE": u"/Date(1450069200000)/",
                                       "UPDATE_DATE": u"/Date(1450069200000)/",
                                       "BUDGET_YEAR": 2015,
                                       "SOLD_TO_PARTY": "Z43801",
                                       "SOLD_TO_PARTY_DESCRIPTION": "UNICEF-UGANDA-KAMPALA",
                                       "SHIP_TO_PARTY": "438",
                                       "SHIP_TO_PARTY_DESCRIPTION": "Uganda",
                                       "SO_ITEM_NO": 10,
                                       "REQUISITION_NO": "0030344855",
                                       "REQUISITION_ITEM_NO": 10,
                                       "PURCHASING_GROUP_NAME_SHORT": "Kampala, Uganda",
                                       "WBS_REFERENCE": "4380A004105007042",
                                       "GRANT_REF": "SM150377",
                                       "GRANT_EXPIRY_DATE": u"/Date(1451538000000)/",
                                       "DONOR_NAME": "UNICEF-UGANDA-KAMPALA",
                                       "MATERIAL_CODE": "SL009100",
                                       "MATERIAL_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                                       "SO_ITEM_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                                       "NET_VALUE": 2673}]}]

        order_info = ('SALES_ORDER_NO', 'WBS_REFERENCE')
        self.assertEqual(format_records(orders, order_info), formatted_orders)
