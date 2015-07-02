from unittest import TestCase
import os
import datetime
from decimal import Decimal

from mock import MagicMock
from xlwt import Workbook

from eums.models import Item, PurchaseOrder, PurchaseOrderItem, SalesOrder, SalesOrderItem
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
from eums.vision.vision_facade import PurchaseOrderFacade


class TestPurchaseOrdersVisionFacade(TestCase):
    def setUp(self):
        self.purchase_order_file_location = 'purchase_orders.xlsx'
        self.create_purchase_order_workbook()
        self.imported_purchase_order_data = [{'order_number': 54101099,
                                              'so_number': 20153976,
                                              'po_date': '2015-01-15',
                                              'po_type': 'ZLC',
                                              'items': [{'material_code': 'SL005144',
                                                         'material_description': 'Laptop Lenovo ThinkPad T510',
                                                         'quantity': 8000,
                                                         'value': 3436.82,
                                                         'po_item_number': 10,
                                                         'so_item_number': 10},
                                                        {'material_code': 'SL002248',
                                                         'material_description': 'Laptop bag',
                                                         'quantity': 1000,
                                                         'value': 2000.01,
                                                         'po_item_number': 20,
                                                         'so_item_number': 20}]},
                                             {'order_number': 54101128,
                                              'so_number': 20143982,
                                              'po_date': '2015-01-15',
                                              'po_type': 'NB',
                                              'items': [{'material_code': 'S0000208',
                                                         'material_description': 'F-75 therap.diet sachet 102.5g/CAR-120',
                                                         'quantity': 5000,
                                                         'value': 4850.19,
                                                         'po_item_number': 20,
                                                         'so_item_number': 20}]}]
        self.updated_imported_purchase_order_data = [{'order_number': 54101099,
                                                      'so_number': 20153976,
                                                      'po_date': '2015-10-15',
                                                      'po_type': 'NB',
                                                      'items': [{'material_code': 'SL005144',
                                                                 'material_description': 'Laptop Lenovo ThinkPad T510',
                                                                 'quantity': 16000,
                                                                 'value': 6873.64,
                                                                 'po_item_number': 10,
                                                                 'so_item_number': 10},
                                                                {'material_code': 'SL002248',
                                                                 'material_description': 'Laptop bag',
                                                                 'quantity': 1000,
                                                                 'value': 2000.01,
                                                                 'po_item_number': 20,
                                                                 'so_item_number': 20}]},
                                                     {'order_number': 54101128,
                                                      'so_number': 20143982,
                                                      'po_date': '2015-11-15',
                                                      'po_type': 'ZLC',
                                                      'items': [{'material_code': 'S0000208',
                                                                 'material_description': 'F-75 therap.diet sachet 102.5g/CAR-120',
                                                                 'quantity': 5000,
                                                                 'value': 4850.19,
                                                                 'po_item_number': 20,
                                                                 'so_item_number': 20}]}]

        self.facade = PurchaseOrderFacade(self.purchase_order_file_location)

    def tearDown(self):
        os.remove(self.purchase_order_file_location)
        SalesOrderItem.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        Item.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        SalesOrder.objects.all().delete()

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

        self.third_row = [u'1000', u'617', u'Kampala, Uganda', u'5617', u'', u'NB', u'0030323186', u'20', u'01/14/2015',
                          u'8000', u'S0000208', u'F-75 therap.diet sachet 102.5g/CAR-120', u'Z11109', u'54101128',
                          u'20', u'NB', u'01/15/2015', u'01/15/2015', u'SOLOWO', u'2300026922', u'1', u'', u'DAP',
                          u'ALIVE:WASH', u'5000', u'EA', u'01/30/2015', u'EA', u'1', u'1', u'1190.00', u'1',
                          u'9520000.00', u'', u'0', u'X43805', u'9116811031', u'10', u'1', u'20143982', u'ZSL', u'UGX',
                          u'4850.19', u'9520000.00', u'9520000.00', u'0.00', u'Techno Relief Services (U) Ltd', u'438',
                          u'Uganda', u'UNICEF KAMPALA', u'438', u'Uganda', u'12', u'(ESARO)EASTERN AND SOUTHERN AFRICA',
                          u'RFQ', u'07/22/2014', u'ALIVE:WASH Ltrine mt', u'07/22/2014', u'ZCOM', u'', u'', u'111',
                          u'Sanitation & Hygiene', u'Z1', u'Misc Std Non Stock', u'Z111', u'WATER AND SANITATION',
                          u'01/12/2015', u'01/12/2015', u'01/12/2015', u'01/15/2015', u'01/12/2015', u'01/15/2015',
                          u'2015-01-15', u'Z43801', u'UNICEF-UGANDA-KAMPALA', u'438', u'Uganda', u'12',
                          u'(ESARO)EASTERN AND SOUTHERN AFRICA', u'', u'', u'N', u'', u'', u'4380/A0/04/105/007/017',
                          u'0001310190', u'SM', u'SM140277', u'01.01.2014', u'30.06.2015', u'PROG']

        rows = [self.header, self.first_row, self.second_row, self.third_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.purchase_order_file_location)

    def create_items(self):
        self.item_one = ItemFactory(material_code='SL005144', description='Laptop Lenovo ThinkPad T510')
        self.item_two = ItemFactory(material_code='SL002248', description='Laptop bag')
        self.item_three = ItemFactory(material_code='S0000208', description='F-75 therap.diet sachet 102.5g/CAR-120')

    def create_sales_orders(self):
        self.sales_order_one = SalesOrderFactory(order_number=20153976)
        self.sales_order_two = SalesOrderFactory(order_number=20143982)
        self.sales_order_item_one = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_one,
                                                          item_number=10)
        self.sales_order_item_two = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_two,
                                                          item_number=20)
        self.sales_order_item_three = SalesOrderItemFactory(sales_order=self.sales_order_two, item=self.item_three,
                                                            item_number=20)

    def test_should_load_purchase_order_data(self):
        purchase_order_data = self.facade.load_records()

        self.assertEqual(purchase_order_data, self.imported_purchase_order_data)

    def test_should_save_purchase_order_data(self):
        self.assertEqual(PurchaseOrder.objects.count(), 0)
        self.assertEqual(PurchaseOrderItem.objects.count(), 0)

        self.create_items()
        self.create_sales_orders()

        self.facade.save_records(self.imported_purchase_order_data)

        self.assert_purchase_orders_were_created()
        self.assert_purchase_order_items_were_created()

    def test_should_not_save_a_purchase_order_with_no_matching_sales_order(self):
        self.create_items()

        self.facade.save_records(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrder.objects.count(), 0)

    def test_should_not_recreate_existing_purchase_orders_when_saving_only_matching_by_order_number(self):
        self.create_items()
        self.create_sales_orders()

        self.facade.save_records(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrder.objects.count(), 2)

        first_release_order = PurchaseOrder.objects.all().first()
        first_release_order.delivery_date = datetime.date(2100, 01, 13)
        first_release_order.save()

        self.facade.save_records(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrder.objects.count(), 2)

    def test_should_not_create_existing_purchase_order_items_when_there_is_matching_sales_order_item(self):
        self.create_items()

        self.sales_order_one = SalesOrderFactory(order_number=20148031)
        self.sales_order_two = SalesOrderFactory(order_number=20147537)

        self.facade.save_records(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 0)

    def test_should_update_existing_purchase_order_date_and_po_type_when_saving_only_matching_by_order_number(self):
        self.create_items()
        self.create_sales_orders()

        self.facade.save_records(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 3)

        self.facade.save_records(self.updated_imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 3)
        self.assertEqual(str(PurchaseOrder.objects.all()[0].date),
                         self.updated_imported_purchase_order_data[0]['po_date'])
        self.assertEqual(PurchaseOrder.objects.all()[0].po_type,
                         self.updated_imported_purchase_order_data[0]['po_type'])

    def test_should_update_existing_purchase_order_items_when_saving_only_matching_by_order_number(self):
        self.create_items()
        self.create_sales_orders()

        self.facade.save_records(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 3)

        self.facade.save_records(self.updated_imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 3)

        first_purchase_order_item = PurchaseOrderItem.objects.all().first()

        expected_po_item = PurchaseOrderItem(purchase_order=PurchaseOrder.objects.all()[0], item_number=10,
                                             sales_order_item=SalesOrderItem.objects.all()[0], quantity=16000,
                                             value=Decimal('6873.64'))

        self.assertEqual(expected_po_item, first_purchase_order_item)

    def test_should_load_purchase_orders_from_excel_and_save(self):
        self.assertEqual(PurchaseOrder.objects.count(), 0)

        self.facade.load_records = MagicMock(return_value=self.imported_purchase_order_data)
        self.facade.save_records = MagicMock()

        self.facade.import_records()

        self.facade.load_records.assert_called()
        self.facade.save_records.assert_called_with(self.imported_purchase_order_data)

    def assert_purchase_orders_were_created(self):
        self.purchase_order_one = PurchaseOrder(order_number=54101099, sales_order=self.sales_order_one,
                                                date=datetime.date(2015, 1, 15))
        self.purchase_order_two = PurchaseOrder(order_number=54101128, sales_order=self.sales_order_two,
                                                date=datetime.date(2015, 1, 15))
        self.assert_purchase_orders_are_equal(self.purchase_order_one, PurchaseOrder.objects.all()[0])
        self.assert_purchase_orders_are_equal(self.purchase_order_two, PurchaseOrder.objects.all()[1])

    def assert_purchase_order_items_were_created(self):
        order_item_one = PurchaseOrderItem(purchase_order=self.purchase_order_one, item_number=20,
                                           sales_order_item=self.sales_order_item_two, quantity=1000,
                                           value=Decimal('2000.01'))
        order_item_two = PurchaseOrderItem(purchase_order=self.purchase_order_one, item_number=10,
                                           sales_order_item=self.sales_order_item_one, quantity=8000,
                                           value=Decimal('3436.82'))
        order_item_three = PurchaseOrderItem(purchase_order=self.purchase_order_two, item_number=20,
                                             sales_order_item=self.sales_order_item_three, quantity=5000,
                                             value=Decimal('4850.19'))

        purchase_order_items = PurchaseOrderItem.objects.all().order_by('purchase_order__order_number')

        self.assertIn(order_item_one, purchase_order_items)
        self.assertIn(order_item_two, purchase_order_items)
        self.assertIn(order_item_three, purchase_order_items)

    def assert_consignees_are_equal(self, consignee_one, consignee_two):
        self.assertEqual(consignee_one.name, consignee_two.name)
        self.assertEqual(consignee_one.customer_id, consignee_two.customer_id)
        self.assertEqual(consignee_one.type, consignee_two.type)

    def assert_purchase_orders_are_equal(self, order_one, order_two):
        self.assertEqual(order_one.order_number, order_two.order_number)
        self.assertEqual(order_one.sales_order_id, order_two.sales_order_id)
        self.assertEqual(order_one.date, order_two.date)
