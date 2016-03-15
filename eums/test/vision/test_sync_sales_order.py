import datetime
from decimal import Decimal
from unittest import TestCase

from mock import MagicMock

from eums.models import SalesOrder, SalesOrderItem, Item, OrderItem, Programme
from eums.test.vision.data.sales_orders import downloaded_sales_orders, converted_sales_orders
from eums.vision.sales_order_synchronizer import SalesOrderSynchronizer


class TestSyncSalesOrder(TestCase):
    def setUp(self):
        self.downloaded_sales_orders = downloaded_sales_orders
        self.converted_sales_orders = converted_sales_orders

        Programme.objects.create(wbs_element_ex='0060/A0/07/883')

        self.expected_programme = Programme(wbs_element_ex='0060/A0/07/883')
        self.expected_sales_order = SalesOrder(programme=self.expected_programme,
                                               order_number=20173918,
                                               date=datetime.date(2015, 12, 6))
        self.expected_item = Item(description='Scale,electronic,mother/child,150kgx100g',
                                  material_code='S0141021')
        self.expected_sales_order_item = SalesOrderItem(sales_order=self.expected_sales_order,
                                                        item=self.expected_item,
                                                        net_price=0,
                                                        net_value=Decimal('51322.6500'),
                                                        issue_date=datetime.date(2015, 12, 6),
                                                        delivery_date=datetime.date(2015, 12, 6),
                                                        description='Scale,electronic,mother/child,150kgx100g')
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
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._save_records.assert_called()

    def test_should_convert_original_sales_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_sales_orders)
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._save_records.assert_called_with(self.converted_sales_orders)

    def test_should_save_sales_orders(self):
        self._sync_sales_order()
        sales_order = SalesOrder.objects.all().first()

        self._assert_sales_orders_equal(sales_order, self.expected_sales_order)

    def test_should_save_sales_order_items(self):
        self._sync_sales_order()
        sales_order_item = SalesOrderItem.objects.all().first()

        self._assert_sales_order_item_equal(sales_order_item, self.expected_sales_order_item)

    def test_should_NOT_update_when_got_an_older_sales_order(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_sales_orders)
        self.synchronizer.sync()
        older_sales_order = [{"SALES_ORDER_NO": u"0020173918",
                              "DOCUMENT_TYPE": "ZCOM",
                              "DOCUMENT_DATE": u"/Date(1449118800000)/",
                              "CREATE_DATE": u"/Date(1449118800000)/",
                              "UPDATE_DATE": u"/Date(1449118800000)/",
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
                              "NET_VALUE": 100000}]

        self.synchronizer._load_records = MagicMock(return_value=older_sales_order)
        self.synchronizer.sync()

        sales_order = SalesOrder.objects.get(order_number='20173918')
        self.assertEqual(sales_order.date, datetime.datetime(2015, 12, 6, 8, 0).date())

        sales_order_item = SalesOrderItem.objects.get(sales_order=sales_order, item_number=80)
        self.assertEqual(sales_order_item.net_value, Decimal('51322.6500'))

    def test_should_update_when_got_a_newer_sales_order(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_sales_orders)
        self.synchronizer.sync()
        newer_sales_order = [{"SALES_ORDER_NO": u"0020173918",
                              "DOCUMENT_TYPE": "ZCOM",
                              "DOCUMENT_DATE": u"/Date(1449118800000)/",
                              "CREATE_DATE": u"/Date(1449118800000)/",
                              "UPDATE_DATE": u"/Date(1450069200000)/",
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
                              "NET_VALUE": 10000.11}]

        self.synchronizer._load_records = MagicMock(return_value=newer_sales_order)
        self.synchronizer.sync()

        sales_order = SalesOrder.objects.get(order_number='20173918')
        self.assertEqual(sales_order.date, datetime.datetime(2015, 12, 14, 8, 0).date())

        sales_order_item = SalesOrderItem.objects.get(sales_order=sales_order, item_number=80)
        self.assertEqual(sales_order_item.net_value, Decimal('10000.1100'))

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
