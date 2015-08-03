from django.contrib.auth.models import User
from eums.models import SalesOrderItem, PurchaseOrderItem, Item, PurchaseOrder, SalesOrder
from eums.test.api.api_test_helpers import create_user_with_group
from eums.test.api.authorization.permissions_test_case import PermissionsTestCase
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
import os
from eums.management.commands.setup_permissions import Command
from xlwt import Workbook


class TestImportPurchaseOrdersEndpoint(PermissionsTestCase):
    def setUp(self):
        self.purchase_order_file_location = 'purchase_orders.xlsx'
        self.create_purchase_order_workbook()

        self.create_items()
        self.create_sales_orders()

        Command().handle()

    def tearDown(self):
        os.remove(self.purchase_order_file_location)
        SalesOrderItem.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        Item.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        SalesOrder.objects.all().delete()
        User.objects.all().delete()

    def test_should_allow_authorised_user_to_import_purchase_orders(self):
        username = 'unicef_admin1'
        password = 'password'
        create_user_with_group(username=username, password=password, email='admin@email.com', group='UNICEF_admin')
        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.purchase_order_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-purchase-orders/', FILES)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(PurchaseOrderItem.objects.count(), 2)

            self.assertEqual(PurchaseOrderItem.objects.filter(
                sales_order_item__description='Laptop Lenovo ThinkPad T510').count(),
                1)
            self.assertEqual(
                PurchaseOrderItem.objects.filter(sales_order_item__description__exact='Laptop bag').count(), 1)

    def test_should_not_allow_unauthorised_user_to_import_purchase_orders(self):
        username = 'IP editor'
        password = 'password'
        create_user_with_group(username=username, password=password, email='ip_editor@mail.com',
                               group='Implementing Partner_editor')
        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.purchase_order_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-purchase-orders/', FILES)

            self.assertEqual(response.status_code, 403)
            self.assertEqual(PurchaseOrderItem.objects.count(), 0)


    def create_purchase_order_workbook(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['Purchasing Org', 'Purchasing Group', 'Purchasing Group Description', 'Plant',
                       'Storage Location', 'PReq Type', 'PReq No', 'PReq Item', 'PReq Creation Date', 'PReq Qty',
                       'Material No', 'Material Short Text', 'Material Group', 'PO No', 'PO Item', 'PO Type',
                       'PO Creation Date', 'PO Doc. Date', 'PO Created By', 'Vendor Code', 'Release Indicator',
                       'Deletion Indicator', 'Inco Terms', 'Tracking No', 'PO Quantity', 'PO UOM', 'PO Delivery Date',
                       'Order Price Unit', 'Price Conv. (price)', 'Price Conv. (qty)', 'Net Price', 'Price Unit',
                       'Net Value', 'LTA No.', 'LTA Item No.', 'Consignee Code', 'RFQ No.', 'RFQ Item No.',
                       'Seq. No. of Account Assgt', 'SO Document No.', 'Material Type	Currency', 'USD Value',
                       'Gross Value', 'Effective Value', 'Grand Total', 'Vendor Name', 'Vendor Country',
                       'Vendor Country Name', 'Consignee Name', 'Consignee Country', 'Consignee Country Name',
                       'Consignee Region Code', 'Consignee Region Name', 'PO Line Process', 'SO Creation Date',
                       'SO Short Desc', 'SO Issue Date', 'SO Doc Type', 'Order Reason Code', 'Order Reason Text',
                       'MM Pur Group', '	Material Group Description', 'Material Type', 'Material Type Description',
                       'Material Sub Type', 'Material Sub Type Description', 'Mstr ITB Creation Date',
                       'Mstr ITB Release Date', 'Mstr ITB Mailing Date', 'Mstr ITB Opening Date',
                       'Replt ITB Creation Date', 'PO Release Date(First)', 'PO Release Date(Latest)',
                       'Sold To Party Code', 'Sold To Party Name', 'Receiving Country', 'Receiving Country Name',
                       'Receiving Country Region Code', 'Receiving Country Region Name', 'Funding Code', 'Funding Name',
                       'Direct Order Indicator', 'Forwarder Code', 'Forwarder Name', 'WBS', 'GL Account', 'Fund',
                       'Grant', 'Grant Valid From', 'Grant Valid Until', 'Line Category', 'Preq LPA Flag',
                       'Preq LPA Reference']

        self.first_row = [u'1000', u'617', u'Kampala, Uganda', u'5617', u'', u'NB', u'0030323186', u'10', u'01/14/2015',
                          u'8000', u'SL005144', u'Laptop Lenovo ThinkPad T510', u'Z11109', u'54101099', u'10', u'ZLC',
                          u'01/15/2015', u'01/15/2015', u'SOLOWO', u'2300026922', u'1', u'', u'DAP', u'ALIVE:WASH',
                          u'8000', u'EA', u'01/30/2015', u'EA', u'1', u'1', u'1190.00', u'1', u'9520000.00', u'', u'0',
                          u'X43805', u'9116811031', u'10', u'1', u'20153976', u'ZSL', u'UGX', u'3436.82', u'9520000.00',
                          u'9520000.00', u'0.00', u'Techno Relief Services (U) Ltd', u'438', u'Uganda',
                          u'UNICEF KAMPALA', u'438', u'Uganda', u'12', u'(ESARO)EASTERN AND SOUTHERN AFRICA', u'RFQ',
                          u'07/22/2014', u'ALIVE:WASH Ltrine mt', u'07/22/2014', u'ZCOM', u'', u'', u'111',
                          u'Sanitation & Hygiene', u'Z1', u'Misc Std Non Stock', u'Z111', u'WATER AND SANITATION',
                          u'01/12/2015', u'01/12/2015', u'01/12/2015', u'01/15/2015', u'01/12/2015', u'01/15/2015',
                          u'2015-01-15', u'Z43801', u'UNICEF-UGANDA-KAMPALA', u'438', u'Uganda', u'12',
                          u'(ESARO)EASTERN AND SOUTHERN AFRICA', u'', u'', u'N', u'', u'', u'4380/A0/04/105/007/017',
                          u'0001310190', u'SM', u'SM140277', u'01.01.2014', u'30.06.2015', u'PROG']

        self.second_row = [u'1000', u'617', u'Kampala, Uganda', u'5617', u'', u'NB', u'0030323186', u'20',
                           u'01/14/2015', u'8000', u'SL002248', u'Laptop bag', u'Z11109', u'54101099', u'20', u'ZLC',
                           u'01/15/2015', u'01/15/2015', u'SOLOWO', u'2300026922', u'1', u'', u'DAP', u'ALIVE:WASH',
                           u'1000', u'EA', u'01/30/2015', u'EA', u'1', u'1', u'1190.00', u'1', u'9520000.00', u'', u'0',
                           u'X43805', u'9116811031', u'10', u'1', u'20153976', u'ZSL', u'UGX', u'2000.01',
                           u'9520000.00', u'9520000.00', u'0.00', u'Techno Relief Services (U) Ltd', u'438', u'Uganda',
                           u'UNICEF KAMPALA', u'438', u'Uganda', u'12', u'(ESARO)EASTERN AND SOUTHERN AFRICA', u'RFQ',
                           u'07/22/2014', u'ALIVE:WASH Ltrine mt', u'07/22/2014', u'ZCOM', u'', u'', u'111',
                           u'Sanitation & Hygiene', u'Z1', u'Misc Std Non Stock', u'Z111', u'WATER AND SANITATION',
                           u'01/12/2015', u'01/12/2015', u'01/12/2015', u'01/15/2015', u'01/12/2015', u'01/15/2015',
                           u'15/01/2015', u'Z43801', u'UNICEF-UGANDA-KAMPALA', u'438', u'Uganda', u'12',
                           u'(ESARO)EASTERN AND SOUTHERN AFRICA', u'', u'', u'N', u'', u'', u'4380/A0/04/105/007/017',
                           u'0001310190', u'SM', u'SM140277', u'01.01.2014', u'30.06.2015', u'PROG']

        rows = [self.header, self.first_row, self.second_row]
        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.purchase_order_file_location)

    def create_items(self):
        self.item_one = ItemFactory(material_code='SL005144', description='Laptop Lenovo ThinkPad T510')
        self.item_two = ItemFactory(material_code='SL002248', description='Laptop bag')

    def create_sales_orders(self):
        self.sales_order_one = SalesOrderFactory(order_number=20153976)
        self.sales_order_two = SalesOrderFactory(order_number=20143982)
        self.sales_order_item_one = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_one,
                                                          item_number=10, description='Laptop Lenovo ThinkPad T510')
        self.sales_order_item_two = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_two,
                                                          item_number=20, description='Laptop bag')