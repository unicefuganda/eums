import os

from django.contrib.auth.models import User
from django.core.management import call_command
from rest_framework.test import APITestCase
from xlwt import Workbook

from eums.models import Item, SalesOrder, SalesOrderItem, Programme
from eums.test.api.api_test_helpers import create_user_with_group
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'import-data/'


class TestImportSalesOrderEndpoint(APITestCase):
    def setUp(self):
        self.sales_order_file_location = 'sales_orders.xlsx'
        self.create_sales_order_workbook()
        call_command('setup_permissions')

    def tearDown(self):
        os.remove(self.sales_order_file_location)
        Item.objects.all().delete()
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        Programme.objects.all().delete()
        User.objects.all().delete()

    def test_should_allow_authorised_user_to_import_sales_orders(self):
        username = 'unicef_admin1'
        password = 'password'

        create_user_with_group(username=username, password=password, email='admin@email.com', group='UNICEF_admin')

        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.sales_order_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-sales-orders/', FILES)

            self.assertEqual(response.status_code, 200)
            sales_order_item_descriptions = [sales_order_item.description for sales_order_item in
                                             SalesOrderItem.objects.all()]
            self.assertEqual(len(sales_order_item_descriptions), 2)
            self.assertIn('SQFlex 3-10 Pump C/W 1.4KW', sales_order_item_descriptions)
            self.assertIn('Solar Power System', sales_order_item_descriptions)

    def test_should_not_allow_unauthorised_user_to_import_sales_orders(self):
        username = 'IP editor'
        password = 'password'
        create_user_with_group(username=username, password=password, email='ip_editor@mail.com', group='Implementing Partner_editor')

        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.sales_order_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-sales-orders/', FILES)
            self.assertEqual(response.status_code, 403)

            self.assertEqual(SalesOrderItem.objects.count(), 0)

    def create_sales_order_workbook(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['Sales Document', 'Sales Document Item', 'Material', 'Sales Order Qty', 'PO/STO Qty',
                       'Item budget', 'Purchase order no.', 'Purchase order date', 'Budget year', 'Document Date',
                       'Description', 'Receiving country', 'Country Short Name', 'WBS Element', 'Grant',
                       'User field 1 WBS element', 'PGI/IR Quantity', 'Pgi/IR Amount', 'Shipment Qty',
                       'Ship Inv. Amount', 'Ship Insurance Amt', 'Budget - Pgi/Ir - Ship Ins. - Ship Inv',
                       'Delivery Completed', 'Shipping Completed', 'Supplies and freight action complete', 'Zflow_new',
                       'Delivery Completed', 'Final Invoice', 'WBS_Supply_expenditure', 'WBS_Freight_expenditure',
                       'WBS_Others_expenditure', 'PO/STO Amount', 'Purchasing Document']

        self.first_row = [u'20146879', u'10', u'S0009113', u'1', u'1', u'3179.47', u'Emergency:Kyangwali',
                          u'2014-01-03',
                          u'2014', u'2014-01-03', u'SQFlex 3-10 Pump C/W 1.4KW', u'438', u'UGANDA',
                          u'4380/A0/04/105/007/020',
                          u'SM130359' u'fhdd-sjs', u'0', u'0', u'0', u'0 ', u'0', u'3179.47', u'1', u'1', u'@02', u'dk',
                          u'Yes',
                          u'No', u'0',
                          u'0', u'0', u'2953.79', u'76088583']

        self.second_row = [20146879, '20', 'SL006173', '12', '12', '2638.32', 'Emergency:Kyangwali', '2014-01-03',
                           '2014', '2014-01-03', 'Solar Power System', '438', 'UGANDA',
                           '4380/A0/04/105/007/020', 'SM130359', '1', '0', '0', '0', '0 ', '0', '2638.32', '1', '1',
                           '@02@', '1', 'Yes', 'No', '0', '0', '0', '2451.02', '76088583']

        rows = [self.header, self.first_row, self.second_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.sales_order_file_location)
