from unittest import TestCase
from django.contrib.auth.models import User
import os

from xlwt import Workbook
from eums.models import SalesOrder, Item, SalesOrderItem, Programme
from eums.test.factories.item_factory import ItemFactory

from eums.vision.vision_facade import load_sales_order_data, save_sales_order_data, import_sales_orders


class TestVisionFacade(TestCase):
    def setUp(self):
        self.sales_order_file_location = 'sales_orders.xlsx'
        Programme.objects.get_or_create(name='ALIVE', focal_person=User.objects.create(username='Test',
                                                                                       first_name='Test',
                                                                                       last_name='User'))

        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['Sales Document Type', 'Sales Document', 'Sold-to party', 'Shipping Point/Receiving Pt',
                       'Status', 'Created by', 'Item (SD)', 'Material', 'Order Quantity', 'Confirmed Quantity',
                       'Created on', 'Goods Issue Date', 'Delivery Date', 'Purchase order no.', 'Pricing date',
                       'Net price', 'Net Value', 'Schedule Line Number', 'Description', 'Programme']

        self.first_row = ['ZCOM', '20155548', 'Z43801', '1500', 'Open', 'RNAULA', '10', 'SL004594', '224,000',
                          '224,000', '2014/09/02', '9/23/2014', '9/23/2014', 'Tally sheets', '9/2/2014', '0.19',
                          '42,560.00', '2', 'Tally sheets printed on A4 Paper', 'ALIVE']

        self.second_row = ['ZCOM', '20155981', 'Z43801', '1500', 'Open', 'RNAULA', '10', 'SL006645', '224,000',
                           '224,000', '2014/09/02', '9/23/2014', '9/23/2014', 'Tally sheets', '9/2/2014', '0.19',
                           '42,560.00', '2', 'Round Neck T-Shirts', 'ALIVE']

        self.third_row = ['ZCOM', '20155981', 'Z43801', '1500', 'Open', 'RNAULA', '10', 'SL004594', '224,000',
                          '224,000', '2014/09/02', '9/23/2014', '9/23/2014', 'Tally sheets', '9/2/2014', '0.19',
                          '42,560.00', '2', 'Round Neck T-Shirts', 'ALIVE']

        for row_index, row in enumerate([self.header, self.first_row, self.second_row, self.third_row]):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.sales_order_file_location)

    def tearDown(self):
        os.remove(self.sales_order_file_location)
        Item.objects.all().delete()
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        Programme.objects.all().delete()
        User.objects.all().delete()

    def test_should_load_sales_order_data(self):
        expected_data = [{'order_number': '20155548',
                          'programme_name': 'ALIVE',
                          'items': [{'material_code': 'SL004594', 'quantity': '224,000', 'date': '2014/09/02',
                                     'issue_date': '9/23/2014', 'programme_name': 'ALIVE',
                                     'delivery_date': '9/23/2014', 'net_price': '0.19', 'net_value': '42,560.00',
                                     'order_number': '20155548'}]},
                         {'order_number': '20155981',
                          'programme_name': 'ALIVE',
                          'items': [{'material_code': 'SL006645', 'quantity': '224,000', 'date': '2014/09/02',
                                     'issue_date': '9/23/2014',
                                     'delivery_date': '9/23/2014', 'net_price': '0.19', 'net_value': '42,560.00',
                                     'programme_name': 'ALIVE', 'order_number': '20155981'},
                                    {'material_code': 'SL004594', 'quantity': '224,000', 'date': '2014/09/02',
                                     'issue_date': '9/23/2014', 'programme_name': 'ALIVE',
                                     'delivery_date': '9/23/2014', 'net_price': '0.19', 'net_value': '42,560.00',
                                     'order_number': '20155981'}]}]

        sales_order_data = load_sales_order_data(self.sales_order_file_location)

        self.assertEqual(sales_order_data, expected_data)

    def test_should_save_sales_order_data(self):
        self.assertEqual(SalesOrder.objects.count(), 0)
        self.assertEqual(SalesOrderItem.objects.count(), 0)

        ItemFactory(material_code='SL004594')
        ItemFactory(material_code='SL006645')

        sales_order_data = [{'order_number': '20155548',
                             'programme_name': 'ALIVE',
                             'items': [{'material_code': 'SL004594', 'quantity': '224,000', 'date': '2014-09-02',
                                        'issue_date': '9/23/2014',
                                        'delivery_date': '9/23/2014', 'net_price': '0.19', 'programme_name': 'ALIVE',
                                        'net_value': '42,560.00', 'order_number': '20155548'}]},
                            {'order_number': '20155981',
                             'programme_name': 'ALIVE',
                             'items': [{'material_code': 'SL006645', 'quantity': '224,000', 'date': '2014-09-02',
                                        'issue_date': '9/23/2014',
                                        'delivery_date': '9/23/2014', 'net_price': '0.19', 'programme_name': 'ALIVE',
                                        'net_value': '42,560.00', 'order_number': '20155981'},
                                       {'material_code': 'SL004594', 'quantity': '224,000', 'date': '2014-09-02',
                                        'issue_date': '9/23/2014',
                                        'delivery_date': '9/23/2014', 'net_price': '0.19', 'programme_name': 'ALIVE',
                                        'net_value': '42,560.00', 'order_number': '20155981'}]}]

        save_sales_order_data(sales_order_data)

        self.assertEqual(SalesOrder.objects.count(), 2)
        self.assertEqual(SalesOrderItem.objects.count(), 3)

    def test_should_load_sales_orders_from_excel_and_save(self):
        self.assertEqual(SalesOrder.objects.count(), 0)

        ItemFactory(material_code='SL004594')
        ItemFactory(material_code='SL006645')

        import_sales_orders(self.sales_order_file_location)

        self.assertEqual(SalesOrder.objects.count(), 2)
        self.assertEqual(SalesOrderItem.objects.count(), 3)