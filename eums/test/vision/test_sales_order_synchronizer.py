import datetime
from decimal import Decimal
from unittest import TestCase

from mock import MagicMock

from eums.models import SalesOrder, SalesOrderItem, Item, OrderItem, Programme
from eums.vision.sales_order_synchronizer import SalesOrderSynchronizer


class TestSalesOrderSynchronizer(TestCase):
    def setUp(self):
        self.downloaded_sales_orders = [{"SALES_ORDER_NO": u"0020173918",
                                         "DOCUMENT_TYPE": "ZCOM",
                                         "DOCUMENT_DATE": "/Date(1449118800000)/",
                                         "CREATE_DATE": "/Date(1449378000000)/",
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
                                         "DOCUMENT_DATE": "/Date(1449118800000)/",
                                         "CREATE_DATE": "/Date(1449378000000)/",
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
                                         "DOCUMENT_DATE": "/Date(1450069200000)/",
                                         "CREATE_DATE": "/Date(1450069200000)/",
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
                                         "GRANT_EXPIRY_DATE": "/Date(1451538000000)/",
                                         "DONOR_NAME": "UNICEF-UGANDA-KAMPALA",
                                         "MATERIAL_CODE": "SL009100",
                                         "MATERIAL_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                                         "SO_ITEM_DESC": "Laundry soap, Carton, 25 bars, 800 grams",
                                         "NET_VALUE": 2673}]

        self.converted_sales_orders = [{'items': [{'item_number': 80,
                                                   'material_code': 'S0141021',
                                                   'net_value': 51322.65,
                                                   'date': '/Date(1449118800000)/',
                                                   'item_description': 'Scale,electronic,mother/child,150kgx100g'},
                                                  {'item_number': 90,
                                                   'material_code': 'S0145620',
                                                   'net_value': 3655.16,
                                                   'date': '/Date(1449118800000)/',
                                                   'item_description': 'MUAC,Child 11.5 Red/PAC-50'}],
                                        'order_number': 20173918, 'programme_wbs_element': '0060A007883001002'},
                                       {'items': [{'item_number': 10,
                                                   'material_code': 'SL009100',
                                                   'net_value': 2673,
                                                   'date': '/Date(1450069200000)/',
                                                   'item_description': 'Laundry soap, Carton, 25 bars, 800 grams'}],
                                        'order_number': 20174363, 'programme_wbs_element': '4380A004105007042'}]

        self.expected_programme_1 = Programme(wbs_element_ex='0060/A0/07/883')
        self.expected_programme_2 = Programme(wbs_element_ex='4380/A0/04/105')
        self.expected_sales_order_1 = SalesOrder(programme=self.expected_programme_1,
                                                 order_number=20173918,
                                                 date=datetime.date(2015, 12, 3))
        self.expected_sales_order_2 = SalesOrder(programme=self.expected_programme_2,
                                                 order_number=20174363,
                                                 date=datetime.date(2015, 12, 14))
        self.expected_item_1 = Item(description='Scale,electronic,mother/child,150kgx100g',
                                    material_code='S0141021')
        self.expected_item_2 = Item(description='MUAC,Child 11.5 Red/PAC-50',
                                    material_code='S0145620')
        self.expected_item_3 = Item(description='Laundry soap, Carton, 25 bars, 800 grams',
                                    material_code='SL009100')
        self.expected_sales_item_1 = SalesOrderItem(sales_order=self.expected_sales_order_1,
                                                    item=self.expected_item_1,
                                                    net_price=0,
                                                    net_value=Decimal('51322.6500'),
                                                    issue_date=datetime.date(2015, 12, 3),
                                                    delivery_date=datetime.date(2015, 12, 3),
                                                    description='Scale,electronic,mother/child,150kgx100g')
        self.expected_sales_item_2 = SalesOrderItem(sales_order=self.expected_sales_order_1,
                                                    item=self.expected_item_2,
                                                    net_price=0,
                                                    net_value=Decimal('3655.16'),
                                                    issue_date=datetime.date(2015, 12, 3),
                                                    delivery_date=datetime.date(2015, 12, 3),
                                                    description='MUAC,Child 11.5 Red/PAC-50')
        self.expected_sales_item_3 = SalesOrderItem(sales_order=self.expected_sales_order_2,
                                                    item=self.expected_item_3,
                                                    net_price=0,
                                                    net_value=Decimal('2673'),
                                                    issue_date=datetime.date(2015, 12, 14),
                                                    delivery_date=datetime.date(2015, 12, 14),
                                                    description='Laundry soap, Carton, 25 bars, 800 grams')
        start_date = '01122015'
        end_date = datetime.date.today().strftime('%d%m%Y')
        self.synchronizer = SalesOrderSynchronizer(start_date=start_date)
        base_url = 'https://devapis.unicef.org/BIService/BIWebService.svc/GetSalesOrderInfo_JSON/'
        self.expected_url = base_url + start_date + '/' + end_date

    def tearDown(self):
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        Item.objects.all().delete()
        OrderItem.objects.all().delete()
        Programme.objects.all().delete()

    def test_should_point_to_correct_endpoint(self):
        self.synchronizer._load_records = MagicMock(return_value=[])
        self.synchronizer.sync()

        self.assertEqual(self.synchronizer.url, self.expected_url)

    def test_should_load_sales_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_sales_orders)
        self.synchronizer._convert_records = MagicMock()
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._convert_records.assert_called_with(self.downloaded_sales_orders)
        self.synchronizer._save_records.assert_called()

    def test_should_convert_original_sales_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_sales_orders)
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._save_records.assert_called_with(self.converted_sales_orders)

    def test_should_save_sales_orders(self):
        self._sync_sales_order()
        all_sales_orders = SalesOrder.objects.all()
        actual_sales_order_1 = all_sales_orders[0]
        actual_sales_order_2 = all_sales_orders[1]

        self._assert_sales_orders_equal(actual_sales_order_1, self.expected_sales_order_1)
        self._assert_sales_orders_equal(actual_sales_order_2, self.expected_sales_order_2)

    def test_should_save_sales_order_items(self):
        self._sync_sales_order()
        all_sales_order_items = SalesOrderItem.objects.all()
        actual_sales_item_1 = all_sales_order_items[0]
        actual_sales_item_2 = all_sales_order_items[1]
        actual_sales_item_3 = all_sales_order_items[2]

        self._assert_sales_order_item_equal(actual_sales_item_1, self.expected_sales_item_1)
        self._assert_sales_order_item_equal(actual_sales_item_2, self.expected_sales_item_2)
        self._assert_sales_order_item_equal(actual_sales_item_3, self.expected_sales_item_3)

    def _sync_sales_order(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_sales_orders)
        self.synchronizer.sync()

    def _assert_programme_equal(self, actual_programme, expected_programme):
        self.assertEqual(actual_programme.wbs_element_ex, expected_programme.wbs_element_ex)
        self.assertEqual(actual_programme.name, expected_programme.name)

    def _assert_sales_orders_equal(self, actual_order, expected_order):
        self.assertEqual(actual_order.order_number, expected_order.order_number)
        self.assertEqual(actual_order.date, expected_order.date)
        self.assertEqual(actual_order.description, expected_order.description)
        self._assert_programme_equal(actual_order.programme, expected_order.programme)

    def _assert_item_equal(self, actual_item, expected_item):
        self.assertEqual(actual_item.description, expected_item.description)
        self.assertEqual(actual_item.material_code, expected_item.material_code)

    def _assert_sales_order_item_equal(self, actual_sales_order_item, expected_sales_order_item):
        self._assert_sales_orders_equal(actual_sales_order_item.sales_order, expected_sales_order_item.sales_order)
        self._assert_item_equal(actual_sales_order_item.item, expected_sales_order_item.item)
        self.assertEqual(actual_sales_order_item.net_price, expected_sales_order_item.net_price)
        self.assertEqual(actual_sales_order_item.net_value, expected_sales_order_item.net_value)
        self.assertEqual(actual_sales_order_item.issue_date, expected_sales_order_item.issue_date)
        self.assertEqual(actual_sales_order_item.delivery_date, expected_sales_order_item.delivery_date)
        self.assertEqual(actual_sales_order_item.description, expected_sales_order_item.description)
