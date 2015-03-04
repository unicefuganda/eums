from unittest import TestCase
import os
import datetime

from mock import MagicMock
from xlwt import Workbook

from eums.models import Item, PurchaseOrder, PurchaseOrderItem, SalesOrder
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
                                             'items': [{'material_code': 'SL005144',
                                                        'material_description': 'Laptop Lenovo ThinkPad T510',
                                                        'po_item_number': 10,
                                                        'so_item_number': 10},
                                                       {'material_code': 'SL002248',
                                                        'material_description': 'Laptop bag',
                                                        'po_item_number': 20,
                                                        'so_item_number': 20}]},
                                            {'order_number': 54101128,
                                             'so_number': 20143982,
                                             'po_date': '2015-01-18',
                                             'items': [{'material_code': 'S0000208',
                                                        'material_description': 'F-75 therap.diet sachet 102.5g/CAR-120',
                                                        'po_item_number': 20,
                                                        'so_item_number': 20}]}]

        self.facade = PurchaseOrderFacade(self.purchase_order_file_location)

    def tearDown(self):
        os.remove(self.purchase_order_file_location)
        Item.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        SalesOrder.objects.all().delete()

    def create_purchase_order_workbook(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['PurGrp','Purchasing Group Name','Document Date','Doc Year','Doc Month','Purchasing Doc. Type',
                       'PurchDoc','PO Item','Schline','Material','PurchaseOrderMaterialText','MatGroup',
                       'Material Group Name','Line Category','Currency','Net Order Price','USD Value','Net Order Value',
                       'QntyPoLineOrder','Scheduled Quantity','Sales Document','Soitem','SO Reason',
                       'Emerg. Approval Field','SO Short Desc.','Sold-to party','SoldToParty name',
                       'Purchase Requisition No.','Purchase Requisition Item No.','LTA Number','LTA Item','Incoterms',
                       'Incoterms2','WBS Element','Grant Expiry Date','Grant','ContractingInfoText','Created by',
                       'Vendor','POVendorName','VendorCtryName','PO Release Status','PO Release Date','PODeldate',
                       'Statdeldate','AB Creation Date','AB Delivery Date','GoodsReadinessDate','GoodsReadvsPODelDate',
                       'Statdatediff','FF Code','FF Name','Partner Function','Shipping Notification Number',
                       'QntyInbDelivery','SR Number','ZA Creation Date','VendGRNotifDate','ActualPickupDate(LA)',
                       'ShipToParty','ShipToParty country','CurrShipmentStart','ETA date','ActualShipmentEnd','Agreed TAD']

        self.first_row = [u'617',u'Kampala, Uganda',u'15/01/2015',u'2015',u'1',u'ZLC',u'54101099',u'10',u'1',u'SL005144',
                          u'Laptop Lenovo ThinkPad T510',u'Z11109',u'WATER AND SANITATION',u'PROG',u'UGX',u'1190.00',
                          u'3436.82',u'9520000.00',u'8000',u'8000',u'20153976',u'10',u'',u'',u'ALIVE:WASH Ltrine mt',
                          u'Z43801',u'UNICEF-UGANDA-KAMPALA',u'30323186',u'40',u'',u'0',u'DAP',u'UNICEF SPEDAG INTERFREIGHT',
                          u'4380/A0/04/105/007/017',u'30.06.2015',u'SM140277',u'',u'SOLOWO',u'2300026922',
                          u'Techno Relief Services (U) Ltd',u'Uganda',u'1',u'2015-01-15',u'30/01/2015',u'30/01/2015',u'',
                          u'',u'09/02/2015',u'10',u'10',u'',u'',u'',u'56186111',u'8000',u'',u'',u'',u'',u'X43805',
                          u'UGANDA',u'',u'',u'',u'22/07/2014']

        self.second_row = [u'617',u'Kampala, Uganda',u'15/01/2015',u'2015',u'1',u'ZLC',u'54101099',u'20',u'1',u'SL002248',
                          u'Laptop bag',u'Z11109',u'WATER AND SANITATION',u'PROG',u'UGX',u'1190.00',
                          u'3436.82',u'9520000.00',u'8000',u'8000',u'20153976',u'20',u'',u'',u'ALIVE:WASH Ltrine mt',
                          u'Z43801',u'UNICEF-UGANDA-KAMPALA',u'30323186',u'40',u'',u'0',u'DAP',u'UNICEF SPEDAG INTERFREIGHT',
                          u'4380/A0/04/105/007/017',u'30.06.2015',u'SM140277',u'',u'SOLOWO',u'2300026922',
                          u'Techno Relief Services (U) Ltd',u'Uganda',u'1',u'15/01/2015',u'30/01/2015',u'30/01/2015',u'',
                          u'',u'09/02/2015',u'10',u'10',u'',u'',u'',u'56186111',u'8000',u'',u'',u'',u'',u'X43805',
                          u'UGANDA',u'',u'',u'',u'22/07/2014']

        self.third_row = [u'617',u'Kampala, Uganda',u'15/01/2015',u'2015',u'1',u'ZLC',u'54101128',u'20',u'1',u'S0000208',
                          u'F-75 therap.diet sachet 102.5g/CAR-120',u'Z11109',u'WATER AND SANITATION',u'PROG',u'UGX',u'1190.00',
                          u'3436.82',u'9520000.00',u'8000',u'8000',u'20143982',u'20',u'',u'',u'ALIVE:WASH Ltrine mt',
                          u'Z43801',u'UNICEF-UGANDA-KAMPALA',u'30323186',u'40',u'',u'0',u'DAP',u'UNICEF SPEDAG INTERFREIGHT',
                          u'4380/A0/04/105/007/017',u'30.06.2015',u'SM140277',u'',u'SOLOWO',u'2300026922',
                          u'Techno Relief Services (U) Ltd',u'Uganda',u'1',u'2015-01-18',u'30/01/2015',u'30/01/2015',u'',
                          u'',u'09/02/2015',u'10',u'10',u'',u'',u'',u'56186111',u'8000',u'',u'',u'',u'',u'X43805',
                          u'UGANDA',u'',u'',u'',u'22/07/2014']

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
        purchase_order_data = self.facade.load_order_data()

        self.assertEqual(purchase_order_data, self.imported_purchase_order_data)

    def test_should_save_purchase_order_data(self):
        self.assertEqual(PurchaseOrder.objects.count(), 0)
        self.assertEqual(PurchaseOrderItem.objects.count(), 0)

        self.create_items()
        self.create_sales_orders()

        self.facade.save_order_data(self.imported_purchase_order_data)

        self.assert_purchase_orders_were_created()
        self.assert_purchase_order_items_were_created()

    def test_should_not_save_a_purchase_order_with_no_matching_sales_order(self):
        self.create_items()

        self.facade.save_order_data(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrder.objects.count(), 0)

    def test_should_not_recreate_existing_purchase_orders_when_saving_only_matching_by_order_number(self):
        self.create_items()
        self.create_sales_orders()

        self.facade.save_order_data(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrder.objects.count(), 2)

        first_release_order = PurchaseOrder.objects.all().first()
        first_release_order.delivery_date = datetime.date(2100, 01, 13)
        first_release_order.save()

        self.facade.save_order_data(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrder.objects.count(), 2)

    def test_should_not_create_existing_purchase_order_items_when_there_is_matching_sales_order_item(self):
        self.create_items()

        self.sales_order_one = SalesOrderFactory(order_number=20148031)
        self.sales_order_two = SalesOrderFactory(order_number=20147537)

        self.facade.save_order_data(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 0)

    def test_should_not_recreate_existing_purchase_order_items_when_saving_only_matching_by_order_number(self):
        self.create_items()
        self.create_sales_orders()

        self.facade.save_order_data(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 3)

        first_purchase_order_item = PurchaseOrderItem.objects.all().first()
        first_purchase_order_item.quantity = -1
        first_purchase_order_item.save()

        self.facade.save_order_data(self.imported_purchase_order_data)
        self.assertEqual(PurchaseOrderItem.objects.count(), 3)

    def test_should_load_purchase_orders_from_excel_and_save(self):
        self.assertEqual(PurchaseOrder.objects.count(), 0)

        self.facade.load_order_data = MagicMock(return_value=self.imported_purchase_order_data)
        self.facade.save_order_data = MagicMock()

        self.facade.import_orders()

        self.facade.load_order_data.assert_called()
        self.facade.save_order_data.assert_called_with(self.imported_purchase_order_data)

    def assert_purchase_orders_were_created(self):
        self.purchase_order_one = PurchaseOrder(order_number=54101099, sales_order=self.sales_order_one,
                                                date=datetime.date(2015, 1, 15))
        self.purchase_order_two = PurchaseOrder(order_number=54101128, sales_order=self.sales_order_two,
                                                date=datetime.date(2015, 1, 18))
        self.assert_purchase_orders_are_equal(self.purchase_order_one, PurchaseOrder.objects.all()[0])
        self.assert_purchase_orders_are_equal(self.purchase_order_two, PurchaseOrder.objects.all()[1])

    def assert_purchase_order_items_were_created(self):
        order_item_one = PurchaseOrderItem(purchase_order=self.purchase_order_one, item_number=10,
                                           sales_order_item=self.sales_order_item_one)
        order_item_two = PurchaseOrderItem(purchase_order=self.purchase_order_one, item_number=20,
                                           sales_order_item=self.sales_order_item_two)
        order_item_three = PurchaseOrderItem(purchase_order=self.purchase_order_two, item_number=20,
                                             sales_order_item=self.sales_order_item_three)

        self.assert_purchase_order_items_are_equal(order_item_one, PurchaseOrderItem.objects.all()[0])
        self.assert_purchase_order_items_are_equal(order_item_two, PurchaseOrderItem.objects.all()[1])
        self.assert_purchase_order_items_are_equal(order_item_three, PurchaseOrderItem.objects.all()[2])

    def assert_consignees_are_equal(self, consignee_one, consignee_two):
        self.assertEqual(consignee_one.name, consignee_two.name)
        self.assertEqual(consignee_one.customer_id, consignee_two.customer_id)
        self.assertEqual(consignee_one.type, consignee_two.type)

    def assert_purchase_orders_are_equal(self, order_one, order_two):
        self.assertEqual(order_one.order_number, order_two.order_number)
        self.assertEqual(order_one.sales_order_id, order_two.sales_order_id)
        self.assertEqual(order_one.date, order_two.date)

    def assert_purchase_order_items_are_equal(self, order_item_one, order_item_two):
        self.assertEqual(order_item_one.purchase_order.order_number, order_item_two.purchase_order.order_number)
        self.assertEqual(order_item_one.item_number, order_item_two.item_number)
        self.assertEqual(order_item_one.sales_order_item.id, order_item_two.sales_order_item.id)