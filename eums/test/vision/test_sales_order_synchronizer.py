import datetime
from decimal import Decimal
from unittest import TestCase

from eums.models import Programme, SalesOrder, SalesOrderItem, Item
from eums.vision.sales_order_synchronizer import SalesOrderSynchronizer


class TestSalesOrderSynchronizer(TestCase):
    def setUp(self):
        self.synchronizer = SalesOrderSynchronizer(start_date='01012015')
        self._prepare_sales_order_and_item()

    def tearDown(self):
        Item.objects.all().delete()
        Programme.objects.all().delete()
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()

    def test_should_convert_wbs_code_format(self):
        wbs_1 = '0060A007883001002'
        wbs_2 = '0060A007883'
        wbs_3 = '0060A00788300100'
        wbs_4 = '0060A'

        self.assertEqual(SalesOrderSynchronizer._convert_wbs_code_format(wbs_1), '0060/A0/07/883')
        self.assertEqual(SalesOrderSynchronizer._convert_wbs_code_format(wbs_2), '0060/A0/07/883')
        self.assertEqual(SalesOrderSynchronizer._convert_wbs_code_format(wbs_3), '')
        self.assertEqual(SalesOrderSynchronizer._convert_wbs_code_format(wbs_4), '')

    def test_should_get_existing_sales_order(self):
        sales_order = {'items': [{'item_number': 80,
                                  'material_code': 'S0141021',
                                  'net_value': 51322.65,
                                  'date': '/Date(1449118800000)/',
                                  'item_description': 'Scale,electronic,mother/child,150kgx100g'}],
                       'order_number': 20173918, 'programme_wbs_element': '0060A007883001002'}

        existing_sales_order = self.synchronizer._get_or_create_new_order(sales_order)

        self.assertEqual(SalesOrder.objects.count(), 1)
        self.assertEqual(existing_sales_order.order_number, 20173918)

    def test_should_create_new_sales_order(self):
        sales_order = {'items': [{'item_number': 80,
                                  'material_code': 'S0141021',
                                  'net_value': 51322.65,
                                  'date': '/Date(1449118800000)/',
                                  'item_description': 'Scale,electronic,mother/child,150kgx100g'}],
                       'order_number': 20179999, 'programme_wbs_element': '0060A007883001002'}

        self.synchronizer._get_or_create_new_order(sales_order)

        self.assertEqual(SalesOrder.objects.count(), 2)
        self.assertEqual(SalesOrder.objects.all().last().order_number, 20179999)

    def test_should_update_existing_sales_order_item(self):
        sales_order_item = {'item_number': 80,
                            'material_code': 'S0141021',
                            'net_value': 60000.38,
                            'date': '/Date(1449118800000)/',
                            'item_description': 'Scale,electronic,mother/child,150kgx100g'}
        self.assertEqual(SalesOrderItem.objects.count(), 1)
        self.assertEqual(SalesOrderItem.objects.all().first().net_value, Decimal('51322.65'))

        self.synchronizer._update_or_create_new_item(sales_order_item, self.sales_order_1)
        self.assertEqual(SalesOrderItem.objects.count(), 1)
        self.assertEqual(SalesOrderItem.objects.all().first().net_value, Decimal('60000.38'))

    def test_should_create_new_sales_order_item(self):
        sales_order_item = {'item_number': 90,
                            'material_code': 'S0145620',
                            'net_value': 3655.16,
                            'date': '/Date(1449118800000)/',
                            'item_description': 'MUAC,Child 11.5 Red/PAC-50'}
        self.assertEqual(SalesOrder.objects.all().first().salesorderitem_set.count(), 1)

        self.synchronizer._update_or_create_new_item(sales_order_item, self.sales_order_1)
        self.assertEqual(SalesOrder.objects.all().first().salesorderitem_set.count(), 2)

    def _prepare_sales_order_and_item(self):
        self.programme_1 = Programme(wbs_element_ex='0060/A0/07/883')
        self.programme_1.save()
        self.sales_order_1 = SalesOrder(programme=self.programme_1,
                                        order_number=20173918,
                                        date=datetime.date(2015, 12, 3))
        self.sales_order_1.save()
        self.item_1 = Item(description='Scale,electronic,mother/child,150kgx100g',
                           material_code='S0141021')
        self.item_1.save()
        self.sales_order_item_1 = SalesOrderItem(sales_order=self.sales_order_1,
                                                 item=self.item_1,
                                                 item_number=80,
                                                 net_price=0,
                                                 net_value=Decimal('51322.6500'),
                                                 issue_date=datetime.date(2015, 12, 3),
                                                 delivery_date=datetime.date(2015, 12, 3),
                                                 description='Scale,electronic,mother/child,150kgx100g')
        self.sales_order_item_1.save()
