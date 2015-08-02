from eums.models import ReleaseOrderItem, PurchaseOrderItem, Item, Consignee, ReleaseOrder, Programme
from eums.models import SalesOrderItem
from eums.test.api.api_test_helpers import create_user_with_group
import os
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
from rest_framework.test import APITestCase
from xlwt import Workbook
from eums.management.commands.setup_permissions import Command


class TestReleaseOrderEndPoint(APITestCase):
    def setUp(self):
        self.release_order_file_location = 'purchase_orders.xlsx'
        self.create_release_order_workbook()

        self.create_items()
        self.create_sales_orders()
        self.create_purchase_orders()

        Command().handle()

    def tearDown(self):
        os.remove(self.release_order_file_location)
        ReleaseOrderItem.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        Item.objects.all().delete()
        Consignee.objects.all().delete()
        ReleaseOrder.objects.all().delete()
        Programme.objects.all().delete()


    def test_should_allow_authorised_user_to_import_release_orders(self):
        username = 'unicef_admin1'
        password = 'password'
        create_user_with_group(username=username, password=password, email='admin@email.com', group='UNICEF_admin')
        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.release_order_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-release-orders/', FILES)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(ReleaseOrderItem.objects.count(), 3)

            self.assertEqual(
                ReleaseOrderItem.objects.filter(
                    purchase_order_item__sales_order_item__description='Laptop Lenovo ThinkPad T510').count(), 1)
            self.assertEqual(
                ReleaseOrderItem.objects.filter(
                    purchase_order_item__sales_order_item__description='Laptop bag').count(), 1)

    def test_should_not_allow_unauthorised_user_to_import_release_orders(self):
        username = 'IP editor'
        password = 'password'
        create_user_with_group(username=username, password=password, email='ip_editor@mail.com',
                               group='Implementing Partner_editor')
        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.release_order_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-release-orders/', FILES)

            self.assertEqual(response.status_code, 403)
            self.assertEqual(ReleaseOrderItem.objects.count(), 0)

    def create_release_order_workbook(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['Release Order Number', 'Release Order Item', 'Release Order Date', 'Recommended Delivery Date',
                       'Material', 'Material Description', 'Delivery Quantity', 'Value', 'Storage Location',
                       'Warehouse Number', 'Warehouse Description', 'Consignee', 'Consignee Name', 'Authorized Person',
                       'Release Document', 'Purchasing Document', 'Delivery', 'Grant', 'WBS Element', 'Pick Status',
                       'Transfer Order Number', 'Transportation Planning Status', 'Waybill Number', 'Forwarder Name',
                       'Shipment End Date', 'Goods Issue Status', 'Goods Issue Date', 'Release Order Sub-Item',
                       'HigherLevelItemBatch', 'Release Order Type', 'Release unit', 'Moving price', 'Plant',
                       'Plant Name', 'Storage Location Desc', 'Dest Warehouse Number', 'Dest Warehouse Description',
                       'Ship-to party', 'Means of Trans. ID', 'Program Officer', 'Release Document Item',
                       'Purchasing Item', 'Reference document', 'Reference item', 'Delivery Item',
                       'Transfer Order Item', 'Forwarder Number', 'Goods Issue Number', 'Goods Issue Item', 'Batch',
                       'SLED/BBD', 'Actual End Planning Date', 'Check-in Date', 'Planned Shipment Start Date',
                       'Loading Start Date', 'Loading End Date', 'Actual Shipment Start Date',
                       'Shipment Completion Date', 'Shipment Days Difference', 'Goods Issue Days Difference',
                       'Handed-Over to IP Planned', 'Handed-Over to IP', 'Reason for Amendment', 'RO User Reference 1',
                       'RO User Reference 2', 'RO User Reference 3', 'RO User Reference 4', 'RO User Reference 5',
                       'WB User Reference 1', 'WB User Reference 2', 'WB User Reference 3', 'WB User Reference 4',
                       'WB User Reference 5']

        self.first_row = [u'54101099', u'10', u'2014-01-08', u'2014-01-08', u'SL005144', u'Laptop Lenovo ThinkPad T510',
                          u'1',
                          u'1167.66', u'2611', u'261', u'Kampala W1', u'L438000393', u'OYAM DISTRICT ADMIN',
                          u'Nuhoddin Maarij', u'20148031', u'81018523', u'56162712', u'SC130003',
                          u'4380/A0/04/107/002/012',
                          u'C', u'7732', u'C', u'72081598', u'UNICEF - Kampala Uganda Kampala Country Office Uganda',
                          u'2014-01-08', u'C', u'8/20/2014', u'0', u'0', u'ZLO', u'EA', u'1167.67', u'5617', u'Uganda',
                          u'Kampala W1-Prog', u'', u'', u'L438000393', u'', u'Silvia Pasti', u'10', u'10', u'', u'1',
                          u'1', u'1',
                          u'F43801', u'4900086016', u'1', u'SYS0084421', u'', u'2014-05-08', u'2014-05-08', u'',
                          u'2014-05-08',
                          u'2014-05-08', u'2014-05-08', u'2014-05-08', u'', u'15', u'', u'', u'', u'', u'', u'', u'',
                          u'',
                          u'CD 96-50U', u'UNICEF', u'Bongomin', u'', u'']
        self.second_row = [u'54101099', u'20', '2014-01-08', '2014-01-08', 'SL002248', 'Laptop bag', '1', '26.81',
                           '2611',
                           '261', 'Kampala W1', 'L438000393', 'OYAM DISTRICT ADMIN', 'Nuhoddin Maarij', u'20148031',
                           u'81018523', u'56162712', 'SC130003', '4380/A0/04/107/002/012', 'C', '7732', 'C',
                           u'72081598',
                           'UNICEF - Kampala Uganda Kampala Country Office Uganda', '2014-04-08', 'C', '2014-08-20',
                           '0',
                           '0', 'ZLO', 'EA', '26.81', '5617', 'Uganda', 'Kampala W1-Prog', '', '', 'L438000393', '',
                           'Silvia Pasti', u'20', u'20', '', '2', '2', '2', 'F43801', '4900086016', '2', 'SYS0084422',
                           '',
                           '2014-05-08', '2014-05-08', '', '2014-05-08', '2014-05-08', '2014-05-08', '2014-05-08', '',
                           '15', '', '', '', '', '', '', '', '', 'CD 96-50U', 'UNICEF', 'Bongomin', '', '']
        self.third_row = [54101128, 10, '2014-08-01', '2014-04-08', 'S0000208',
                          'F-75 therap.diet sachet 102.5g/CAR-120', '20', '1188.79', '2611', '261', 'Kampala W1',
                          'L438000181', 'GULU HOSPITAL', 'NUHODDIN MAARIJ', 20147537, 45132639, 56165211,
                          'SC130708', '4380/A0/04/105/004/022', 'C', '7665', 'C', 72081746,
                          'Express Logistics Group Ltd.', '2014-04-08', 'C', '2014-08-20', '0', '0', 'ZLO', 'CAR',
                          '59.44', '5617', 'Uganda', 'Kampala W1-Prog', '', '', 'L438000181', '', 'PRAKASH LAMSAL',
                          20, 20, '', '2', '2', '2', '2300027179', '4900086015', '2', '100314', '2016-03-31',
                          '2014-07-08', '2014-07-08', '', '2014-07-08', '2014-07-08', '2014-07-08', '1900-02-29', '',
                          '13', '', '', '', '', '', '', '', '', 'UAN 853F', 'EXPRESS LOGISTICS', '2MT', 'SAMUEL', '']

        rows = [self.header, self.first_row, self.second_row, self.third_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.release_order_file_location)

    def create_items(self):
        self.item_one = ItemFactory(material_code='SL005144', description='Laptop Lenovo ThinkPad T510')
        self.item_two = ItemFactory(material_code='SL002248', description='Laptop bag')
        self.item_three = ItemFactory(material_code='S0000208', description='F-75 therap.diet sachet 102.5g/CAR-120')

    def create_sales_orders(self):
        self.sales_order_one = SalesOrderFactory(order_number=20148031, )
        self.sales_order_two = SalesOrderFactory(order_number=20147537)
        self.sales_order_item_one = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_one,
                                                          item_number=10, description='Laptop Lenovo ThinkPad T510')
        self.sales_order_item_two = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_two,
                                                          item_number=20, description='Laptop bag')
        self.sales_order_item_three = SalesOrderItemFactory(sales_order=self.sales_order_two, item=self.item_three,
                                                            item_number=20,
                                                            description='F-75 therap.diet sachet 102.5g/CAR-120')

    def create_purchase_orders(self):
        self.purchase_order_one = PurchaseOrderFactory(order_number=81018523, sales_order=self.sales_order_one)
        self.purchase_order_two = PurchaseOrderFactory(order_number=45132639, sales_order=self.sales_order_two)
        self.purchase_order_item_one = PurchaseOrderItemFactory(purchase_order=self.purchase_order_one,
                                                                sales_order_item=self.sales_order_item_one,
                                                                item_number=10)
        self.purchase_order_item_two = PurchaseOrderItemFactory(purchase_order=self.purchase_order_one,
                                                                sales_order_item=self.sales_order_item_two,
                                                                item_number=20)
        self.purchase_order_item_three = PurchaseOrderItemFactory(purchase_order=self.purchase_order_two,
                                                                  sales_order_item=self.sales_order_item_three,
                                                                  item_number=20)