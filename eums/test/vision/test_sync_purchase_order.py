import datetime
from decimal import Decimal
from unittest import TestCase

from mock import MagicMock

from eums.models import SalesOrder, SalesOrderItem, OrderItem, Item, Programme, PurchaseOrder, PurchaseOrderItem
from eums.vision.purchase_order_synchronizer import PurchaseOrderSynchronizer


class TestSyncPurchaseOrder(TestCase):
    def setUp(self):
        self.downloaded_purchase_orders = [{"SALES_ORDER_NO": u"0020173918",
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

        self.downloaded_purchase_orders = [{"PURCHASING_ORG_CODE": "1000",
                                            "PURCHASING_GROUP_CODE": "104",
                                            "PURCHASING_GROUP_NAME": "IMMUNIZATION",
                                            "PLANT_CODE": "1000",
                                            "VENDOR_CODE": "1900000501",
                                            "VENDOR_NAME": "P.T. BIO FARMA (PERSERO)",
                                            "VENDOR_CTRY_NAME": "Indonesia",
                                            "GRANT_REF": "XP154478",
                                            "EXPIRY_DATE": "/Date(1483160400000)/",
                                            "DONOR_NAME": "Ministry of National Health",
                                            "PREQ_NO": "0030344125",
                                            "PREQ_ITEM": 80,
                                            "PREQ_QTY": 51322.65,
                                            "SO_NUMBER": u"0020173918",
                                            "PO_NUMBER": u"0045143984",
                                            "PO_ITEM": 10,
                                            "PO_TYPE": "NB",
                                            "PO_DATE": "/Date(1448859600000)/",
                                            "PO_ITEM_QTY": 100,
                                            "CURRENCY_CODE": "USD",
                                            "AMOUNT_CURR": 51322.65,
                                            "AMOUNT_USD": 51322.65,
                                            "MATERIAL_CODE": "S0141021",
                                            "MATERIAL_DESC": "Scale,electronic,mother/child,150kgx100g"},

                                           {"PURCHASING_ORG_CODE": "1000",
                                            "PURCHASING_GROUP_CODE": "104",
                                            "PURCHASING_GROUP_NAME": "IMMUNIZATION",
                                            "PLANT_CODE": "1000",
                                            "VENDOR_CODE": "1900000501",
                                            "VENDOR_NAME": "P.T. BIO FARMA (PERSERO)",
                                            "VENDOR_CTRY_NAME": "Indonesia",
                                            "GRANT_REF": "XP154478",
                                            "EXPIRY_DATE": "/Date(1450069200000)/",
                                            "DONOR_NAME": "Ministry of National Health",
                                            "PREQ_NO": "0030344125",
                                            "PREQ_ITEM": 10,
                                            "PREQ_QTY": 2673,
                                            "SO_NUMBER": u"0020174363",
                                            "PO_NUMBER": u"0045144863",
                                            "PO_ITEM": 20,
                                            "PO_TYPE": "ZLC",
                                            "PO_DATE": "/Date(1450069200000)/",
                                            "PO_ITEM_QTY": 80,
                                            "CURRENCY_CODE": "USD",
                                            "AMOUNT_CURR": 2673,
                                            "AMOUNT_USD": 2673,
                                            "MATERIAL_CODE": "SL009100",
                                            "MATERIAL_DESC": "Laundry soap, Carton, 25 bars, 800 grams"}]

        self.converted_purchase_orders = [{'po_date': '/Date(1448859600000)/',
                                           'so_number': 20173918,
                                           'order_number': 45143984,
                                           'po_type': 'NB',
                                           'items': [{'po_item_number': 10,
                                                      'material_description': 'Scale,electronic,mother/child,150kgx100g',
                                                      'value': 51322.65,
                                                      'material_code': 'S0141021',
                                                      'so_item_number': 80,
                                                      'quantity': 100}]},

                                          {'po_date': '/Date(1450069200000)/',
                                           'so_number': 20174363,
                                           'order_number': 45144863,
                                           'po_type': 'ZLC',
                                           'items': [{'po_item_number': 20,
                                                      'material_description': 'Laundry soap, Carton, 25 bars, 800 grams',
                                                      'value': 2673,
                                                      'material_code': 'SL009100',
                                                      'so_item_number': 10,
                                                      'quantity': 80}]}]
        self.purchase_order_which_do_not_have_reference_to_sales_order = \
            [{'po_date': '/Date(1448859600000)/',
              # This so number don't exists in Eums when import this po
              'so_number': 20170001,
              'order_number': 45143984,
              'po_type': 'NB',
              'items': [{'po_item_number': 10,
                         'material_description': 'Scale,electronic,mother/child,150kgx100g',
                         'value': 51322.65,
                         'material_code': 'S0141021',
                         'so_item_number': 80,
                         'quantity': 100}]}]
        self.purchase_order_item_which_do_not_have_reference_to_sales_order_item = \
            [{'po_date': '/Date(1448859600000)/',
              'so_number': 20173918,
              'order_number': 45143984,
              'po_type': 'NB',
              'items': [{'po_item_number': 10,
                         'material_description': 'Scale,electronic,mother/child,150kgx100g',
                         'value': 51322.65,
                         'material_code': 'S0141021',
                         # so item number in Eums is 80, but this one is 70, so this item can't refer to so item
                         'so_item_number': 70,
                         'quantity': 100}]}]
        self.purchase_order_item_with_invalid_po_type = \
            [{'po_date': '/Date(1448859600000)/',
              'so_number': 20173918,
              'order_number': 45143984,
              # For now only NB, ZLC, ZUB, ZOC are supported by Eums
              'po_type': 'ZAM',
              'items': [{'po_item_number': 10,
                         'material_description': 'Scale,electronic,mother/child,150kgx100g',
                         'value': 51322.65,
                         'material_code': 'S0141021',
                         'so_item_number': 80,
                         'quantity': 100}]}]

        self._prepare_sales_orders_and_items()
        self.expected_purchase_order_1 = PurchaseOrder(order_number=45143984,
                                                       sales_order=self.sales_order_1,
                                                       date=datetime.date(2015, 11, 30),
                                                       po_type='NB')
        self.expected_purchase_order_2 = PurchaseOrder(order_number=45144863,
                                                       sales_order=self.sales_order_2,
                                                       date=datetime.date(2015, 12, 14),
                                                       po_type='ZLC')
        self.expected_purchase_order_item_1 = PurchaseOrderItem(purchase_order=self.expected_purchase_order_1,
                                                                item=self.item_1,
                                                                item_number=10,
                                                                sales_order_item=self.sales_item_1,
                                                                quantity=100.00,
                                                                value=Decimal('51322.65'))
        self.expected_purchase_order_item_2 = PurchaseOrderItem(purchase_order=self.expected_purchase_order_2,
                                                                item=self.item_2,
                                                                item_number=20,
                                                                sales_order_item=self.sales_item_2,
                                                                quantity=80.00,
                                                                value=Decimal('2673'))
        start_date = '01122015'
        end_date = datetime.date.today().strftime('%d%m%Y')
        self.synchronizer = PurchaseOrderSynchronizer(start_date=start_date)
        base_url = 'https://devapis.unicef.org/BIService/BIWebService.svc/GetPurchaseOrderInfo_JSON/'
        self.expected_url = base_url + start_date + '/' + end_date

    def tearDown(self):
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        Item.objects.all().delete()
        OrderItem.objects.all().delete()
        Programme.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()

    def test_should_point_to_correct_endpoint(self):
        self.synchronizer._load_records = MagicMock(return_value=[])
        self.synchronizer.sync()

        self.assertEqual(self.synchronizer.url, self.expected_url)

    def test_should_load_purchase_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_purchase_orders)
        self.synchronizer._convert_records = MagicMock()
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._convert_records.assert_called()
        self.synchronizer._save_records.assert_called()

    def test_should_convert_purchase_orders(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_purchase_orders)
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._save_records.assert_called_with(self.converted_purchase_orders)

    def test_should_save_purchase_orders(self):
        self._sync_purchase_order()
        all_purchase_orders = PurchaseOrder.objects.all()
        actual_purchase_order_1 = all_purchase_orders[0]
        actual_purchase_order_2 = all_purchase_orders[1]

        self._assert_purchase_order_equal(actual_purchase_order_1, self.expected_purchase_order_1)
        self._assert_purchase_order_equal(actual_purchase_order_2, self.expected_purchase_order_2)

    def test_should_save_purchase_order_items(self):
        self._sync_purchase_order()
        all_purchase_order_items = PurchaseOrderItem.objects.all()
        actual_purchase_item_1 = all_purchase_order_items[0]
        actual_purchase_item_2 = all_purchase_order_items[1]

        self._assert_purchase_order_item_equal(actual_purchase_item_1, self.expected_purchase_order_item_1)
        self._assert_purchase_order_item_equal(actual_purchase_item_2, self.expected_purchase_order_item_2)

    def test_should_NOT_import_purchase_order_which_can_not_refer_to_existing_sales_order(self):
        self.synchronizer._load_records = MagicMock()
        self.synchronizer._convert_records = MagicMock(
            return_value=self.purchase_order_which_do_not_have_reference_to_sales_order)
        self.synchronizer.sync()

        self.assertEqual(PurchaseOrder.objects.count(), 0)
        self.assertEqual(PurchaseOrderItem.objects.count(), 0)

    def test_should_import_purchase_order_item_which_can_not_refer_to_existing_sales_order_item(self):
        self.synchronizer._load_records = MagicMock()
        self.synchronizer._convert_records = MagicMock(
            return_value=self.purchase_order_item_which_do_not_have_reference_to_sales_order_item)
        self.synchronizer.sync()

        purchase_order = PurchaseOrder.objects.all()[0]
        purchase_order_item = PurchaseOrderItem.objects.all()[0]

        self._assert_purchase_order_equal(purchase_order, self.expected_purchase_order_1)
        self.assertEqual(purchase_order_item.sales_order_item, None)

    def test_should_NOT_import_purchase_order_with_invalid_po_type(self):
        self.synchronizer._load_records = MagicMock()
        self.synchronizer._convert_records = MagicMock(return_value=self.purchase_order_item_with_invalid_po_type)
        self.synchronizer.sync()

        self.assertEqual(PurchaseOrder.objects.count(), 0)
        self.assertEqual(PurchaseOrderItem.objects.count(), 0)

    def _prepare_sales_orders_and_items(self):
        self.expected_programme_1 = Programme(wbs_element_ex='0060/A0/07/883')
        self.expected_programme_1.save()
        self.expected_programme_2 = Programme(wbs_element_ex='4380/A0/04/105')
        self.expected_programme_2.save()
        self.sales_order_1 = SalesOrder(programme=self.expected_programme_1,
                                        order_number=20173918,
                                        date=datetime.date(2015, 12, 3))
        self.sales_order_1.save()
        self.sales_order_2 = SalesOrder(programme=self.expected_programme_2,
                                        order_number=20174363,
                                        date=datetime.date(2015, 12, 14))
        self.sales_order_2.save()

        self.item_1 = Item(description='Scale,electronic,mother/child,150kgx100g',
                           material_code='S0141021')
        self.item_2 = Item(description='Laundry soap, Carton, 25 bars, 800 grams',
                           material_code='SL009100')

        self.sales_item_1 = SalesOrderItem(sales_order=self.sales_order_1,
                                           item=self.item_1,
                                           net_price=0,
                                           net_value=Decimal('51322.6500'),
                                           issue_date=datetime.date(2015, 12, 3),
                                           delivery_date=datetime.date(2015, 12, 3),
                                           description='Scale,electronic,mother/child,150kgx100g')
        self.sales_item_2 = SalesOrderItem(sales_order=self.sales_order_2,
                                           item=self.item_2,
                                           net_price=0,
                                           net_value=Decimal('2673'),
                                           issue_date=datetime.date(2015, 12, 14),
                                           delivery_date=datetime.date(2015, 12, 14),
                                           description='Laundry soap, Carton, 25 bars, 800 grams')

    def _sync_purchase_order(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_purchase_orders)
        self.synchronizer.sync()

    def _assert_purchase_order_equal(self, actual_purchase_order, expected_purchase_order):
        self.assertEqual(actual_purchase_order.order_number, expected_purchase_order.order_number)
        self.assertEqual(actual_purchase_order.date, expected_purchase_order.date)
        self.assertEqual(actual_purchase_order.po_type, expected_purchase_order.po_type)

    def _assert_purchase_order_item_equal(self, actual_purchase_order_item, expected_purchase_order_item):
        self._assert_purchase_order_equal(actual_purchase_order_item.purchase_order,
                                          expected_purchase_order_item.purchase_order)
        self.assertEqual(actual_purchase_order_item.item_number, expected_purchase_order_item.item_number)
        self.assertEqual(actual_purchase_order_item.quantity, expected_purchase_order_item.quantity)
        self.assertEqual(actual_purchase_order_item.value, expected_purchase_order_item.value)
