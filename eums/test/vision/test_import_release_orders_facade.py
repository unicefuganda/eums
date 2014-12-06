from unittest import TestCase
import os
import datetime
from decimal import Decimal

from django.contrib.auth.models import User
from mock import MagicMock
from xlwt import Workbook

from eums.models import Item, Programme, ReleaseOrder, ReleaseOrderItem, PurchaseOrder, PurchaseOrderItem, Consignee
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
from eums.vision.vision_facade import ReleaseOrderFacade


class TestReleaseOrdersVisionFacade(TestCase):
    def setUp(self):
        self.release_order_file_location = 'release_orders.xlsx'
        self.create_release_order_workbook()
        self.imported_release_order_data = [{'order_number': 54101099.0,
                                             'so_number': 20148031.0,
                                             'consignee': u'L438000393',
                                             'consignee_name': u'OYAM DISTRICT ADMIN',
                                             'waybill': 72081598.0,
                                             'recommended_delivery_date': '2014-01-08',
                                             'items': [{'material_code': u'SL005144',
                                                        'description': u'Laptop Lenovo ThinkPad T510',
                                                        'quantity': u'1',
                                                        'value': u'1167.66',
                                                        'purchase_order': 81018523.0,
                                                        'po_item_number': 10,
                                                        'so_item_number': 10},
                                                       {'material_code': u'SL002248',
                                                        'description': u'Laptop bag',
                                                        'quantity': u'1',
                                                        'value': u'26.81',
                                                        'purchase_order': 81018523.0,
                                                        'po_item_number': 20,
                                                        'so_item_number': 20}]},
                                            {'order_number': 54101128.0,
                                             'so_number': 20147537.0,
                                             'consignee': u'L438000181',
                                             'consignee_name': u'GULU HOSPITAL',
                                             'waybill': 72081746.0,
                                             'recommended_delivery_date': '2014-04-08',
                                             'items': [{'material_code': u'S0000208',
                                                        'description': u'F-75 therap.diet sachet 102.5g/CAR-120',
                                                        'quantity': u'20',
                                                        'value': u'1188.79',
                                                        'purchase_order': 45132639.0,
                                                        'po_item_number': 20,
                                                        'so_item_number': 20}]}]

        self.facade = ReleaseOrderFacade(self.release_order_file_location)

    def tearDown(self):
        os.remove(self.release_order_file_location)
        Item.objects.all().delete()
        ReleaseOrder.objects.all().delete()
        ReleaseOrderItem.objects.all().delete()
        Programme.objects.all().delete()
        User.objects.all().delete()
        Consignee.objects.all().delete()

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

        self.first_row = [54101099, 10, '2014-01-08', '2014-01-08', 'SL005144', 'Laptop Lenovo ThinkPad T510', '1',
                          '1167.66', '2611', '261', 'Kampala W1', 'L438000393', 'OYAM DISTRICT ADMIN',
                          'Nuhoddin Maarij', 20148031, 81018523, 56162712, 'SC130003', '4380/A0/04/107/002/012',
                          'C', '7732', 'C', 72081598, 'UNICEF - Kampala Uganda Kampala Country Office Uganda',
                          '08/05/2014', 'C', '8/20/2014', '0', '0', 'ZLO', 'EA', '1167.67', '5617', 'Uganda',
                          'Kampala W1-Prog', '', '', 'L438000393', '', 'Silvia Pasti', 10, 10, '', '1', '1', '1',
                          'F43801', '4900086016', '1', 'SYS0084421', '', '2014-05-08', '2014-05-08', '', '2014-05-08',
                          '2014-05-08', '2014-05-08', '2014-05-08', '', '15', '', '', '', '', '', '', '', '',
                          'CD 96-50U', 'UNICEF', 'Bongomin', '', '']
        self.second_row = [54101099, 20, '2014-01-08', '2014-01-08', 'SL002248', 'Laptop bag', '1', '26.81', '2611',
                           '261', 'Kampala W1', 'L438000393', 'OYAM DISTRICT ADMIN', 'Nuhoddin Maarij', 20148031,
                           81018523, 56162712, 'SC130003', '4380/A0/04/107/002/012', 'C', '7732', 'C', 72081598,
                           'UNICEF - Kampala Uganda Kampala Country Office Uganda', '2014-01-08', 'C', '2014-08-20',
                           '0',
                           '0', 'ZLO', 'EA', '26.81', '5617', 'Uganda', 'Kampala W1-Prog', '', '', 'L438000393', '',
                           'Silvia Pasti', 20, 20, '', '2', '2', '2', 'F43801', '4900086016', '2', 'SYS0084422', '',
                           '2014-05-08', '2014-05-08', '', '2014-05-08', '2014-05-08', '2014-05-08', '2014-05-08', '',
                           '15', '', '', '', '', '', '', '', '', 'CD 96-50U', 'UNICEF', 'Bongomin', '', '']
        self.third_row = [54101128, 20, '2014-08-01', '2014-04-08', 'S0000208',
                          'F-75 therap.diet sachet 102.5g/CAR-120', '20', '1188.79', '2611', '261', 'Kampala W1',
                          'L438000181', 'GULU HOSPITAL', 'NUHODDIN MAARIJ', 20147537, 45132639, 56165211,
                          'SC130708', '4380/A0/04/105/004/022', 'C', '7665', 'C', 72081746,
                          'Express Logistics Group Ltd.', '2014-07-08', 'C', '2014-08-20', '0', '0', 'ZLO', 'CAR',
                          '59.44', '5617', 'Uganda', 'Kampala W1-Prog', '', '', 'L438000181', '', 'PRAKASH LAMSAL',
                          20, 20, '', '2', '2', '2', '2300027179', '4900086015', '2', '100314', '2016-03-31',
                          '2014-07-08', '2014-07-08', '', '2014-07-08', '2014-07-08', '2014-07-08', '2014-07-08', '',
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
        self.sales_order_one = SalesOrderFactory(order_number=20148031)
        self.sales_order_two = SalesOrderFactory(order_number=20147537)
        self.sales_order_item_one = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_one,
                                                          item_number=10)
        self.sales_order_item_two = SalesOrderItemFactory(sales_order=self.sales_order_one, item=self.item_two,
                                                          item_number=20)
        self.sales_order_item_three = SalesOrderItemFactory(sales_order=self.sales_order_two, item=self.item_three,
                                                            item_number=20)

    def create_consignees(self):
        self.consignee_one = ConsigneeFactory(customer_id='L438000393', name='OYAM DISTRICT ADMIN')
        self.consignee_two = ConsigneeFactory(customer_id='L438000181', name='GULU HOSPITAL')

    def test_should_load_release_order_data(self):
        release_order_data = self.facade.load_order_data()

        self.assertEqual(release_order_data, self.imported_release_order_data)

    def test_should_save_release_order_data(self):
        self.assertEqual(ReleaseOrder.objects.count(), 0)
        self.assertEqual(ReleaseOrderItem.objects.count(), 0)

        self.create_consignees()
        self.create_items()
        self.create_sales_orders()

        self.facade.save_order_data(self.imported_release_order_data)

        self.assert_release_orders_were_created()
        self.assert_purchase_orders_were_created()
        self.assert_purchase_order_items_were_created()
        self.assert_release_order_items_were_created()

    def test_should_create_consignee_when_saving_release_order_data_if_there_is_no_matching_consignee(self):
        self.assertEqual(Consignee.objects.count(), 0)

        self.create_items()
        self.create_sales_orders()

        self.facade.save_order_data(self.imported_release_order_data)

        self.assert_consignees_were_created()

    def test_should_not_save_a_release_order_with_no_matching_sales_order(self):
        self.create_consignees()
        self.create_items()

        self.facade.save_order_data(self.imported_release_order_data)
        self.assertEqual(ReleaseOrder.objects.count(), 0)

    def test_should_not_recreate_existing_release_orders_when_saving_only_matching_by_order_number(self):
        self.create_consignees()
        self.create_items()
        self.create_sales_orders()

        self.facade.save_order_data(self.imported_release_order_data)
        self.assertEqual(ReleaseOrder.objects.count(), 2)

        first_release_order = ReleaseOrder.objects.all().first()
        first_release_order.delivery_date = datetime.date(2100, 01, 13)
        first_release_order.save()

        self.facade.save_order_data(self.imported_release_order_data)
        self.assertEqual(ReleaseOrder.objects.count(), 2)

    def test_should_not_create_existing_release_order_items_when_there_is_matching_sales_order_item(self):
        self.create_consignees()
        self.create_items()

        self.sales_order_one = SalesOrderFactory(order_number=20148031)
        self.sales_order_two = SalesOrderFactory(order_number=20147537)

        self.facade.save_order_data(self.imported_release_order_data)
        self.assertEqual(ReleaseOrderItem.objects.count(), 0)

    def test_should_not_recreate_existing_release_order_items_when_saving_only_matching_by_order_number(self):
        self.create_consignees()
        self.create_items()
        self.create_sales_orders()

        self.facade.save_order_data(self.imported_release_order_data)
        self.assertEqual(ReleaseOrderItem.objects.count(), 3)

        first_release_order_item = ReleaseOrderItem.objects.all().first()
        first_release_order_item.quantity = -1
        first_release_order_item.save()

        self.facade.save_order_data(self.imported_release_order_data)
        self.assertEqual(ReleaseOrderItem.objects.count(), 3)

    def test_should_not_recreate_existing_purchase_orders_when_saving_only_matching_by_order_number(self):
            self.create_consignees()
            self.create_items()
            self.create_sales_orders()

            self.facade.save_order_data(self.imported_release_order_data)
            self.assertEqual(PurchaseOrder.objects.count(), 2)

            first_purchase_order = PurchaseOrder.objects.all().first()
            first_purchase_order.date = datetime.date(2100, 01, 13)
            first_purchase_order.save()

            self.facade.save_order_data(self.imported_release_order_data)
            self.assertEqual(PurchaseOrder.objects.count(), 2)

    def test_should_load_release_orders_from_excel_and_save(self):
        self.assertEqual(ReleaseOrder.objects.count(), 0)

        self.facade.load_order_data = MagicMock(return_value=self.imported_release_order_data)
        self.facade.save_order_data = MagicMock()

        self.facade.import_orders()

        self.facade.load_order_data.assert_called()
        self.facade.save_order_data.assert_called_with(self.imported_release_order_data)

    def assert_consignees_were_created(self):
        consignee_one = Consignee(name='OYAM DISTRICT ADMIN', customer_id='L438000393',
                                  type=Consignee.TYPES.implementing_partner)
        consignee_two = Consignee(name='GULU HOSPITAL', customer_id='L438000181',
                                  type=Consignee.TYPES.implementing_partner)

        self.assert_consignees_are_equal(consignee_one, Consignee.objects.all()[0])
        self.assert_consignees_are_equal(consignee_two, Consignee.objects.all()[1])

    def assert_release_orders_were_created(self):
        release_order_one = ReleaseOrder(order_number=54101099, consignee=self.consignee_one, waybill=72081598,
                                         sales_order=self.sales_order_one, delivery_date=datetime.date(2014, 1, 8))
        release_order_two = ReleaseOrder(order_number=54101128, consignee=self.consignee_two, waybill=72081746,
                                         sales_order=self.sales_order_two, delivery_date=datetime.date(2014, 4, 8))

        self.assert_release_orders_are_equal(release_order_one, ReleaseOrder.objects.all()[0])
        self.assert_release_orders_are_equal(release_order_two, ReleaseOrder.objects.all()[1])

    def assert_release_order_items_were_created(self):
        order_item_one = ReleaseOrderItem(release_order=ReleaseOrder.objects.all()[0], item=self.item_one,
                                          purchase_order_item=PurchaseOrderItem.objects.all()[0], quantity=1,
                                          value=Decimal('1167.66'))
        order_item_two = ReleaseOrderItem(release_order=ReleaseOrder.objects.all()[0], item=self.item_two,
                                          purchase_order_item=PurchaseOrderItem.objects.all()[1], quantity=1,
                                          value=Decimal('26.81'))
        order_item_three = ReleaseOrderItem(release_order=ReleaseOrder.objects.all()[1], item=self.item_three,
                                            purchase_order_item=PurchaseOrderItem.objects.all()[2], quantity=20,
                                            value=Decimal('1188.79'))

        self.assert_release_order_items_are_equal(order_item_one, ReleaseOrderItem.objects.all()[0])
        self.assert_release_order_items_are_equal(order_item_two, ReleaseOrderItem.objects.all()[1])
        self.assert_release_order_items_are_equal(order_item_three, ReleaseOrderItem.objects.all()[2])

    def assert_purchase_orders_were_created(self):
        self.purchase_order_one = PurchaseOrder(order_number=81018523, sales_order=self.sales_order_one,
                                                date=datetime.date(2014, 1, 8))
        self.purchase_order_two = PurchaseOrder(order_number=45132639, sales_order=self.sales_order_two,
                                                date=datetime.date(2014, 4, 8))

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

    def assert_release_orders_are_equal(self, order_one, order_two):
        self.assertEqual(order_one.order_number, order_two.order_number)
        self.assertEqual(order_one.consignee_id, order_two.consignee_id)
        self.assertEqual(order_one.delivery_date, order_two.delivery_date)
        self.assertEqual(order_one.waybill, order_two.waybill)
        self.assertEqual(order_one.sales_order_id, order_two.sales_order_id)

    def assert_release_order_items_are_equal(self, order_item_one, order_item_two):
        self.assertEqual(order_item_one.release_order_id, order_item_two.release_order_id)
        self.assertEqual(order_item_one.item_id, order_item_two.item_id)
        self.assertEqual(order_item_one.purchase_order_item_id, order_item_two.purchase_order_item_id)
        self.assertEqual(order_item_one.quantity, order_item_two.quantity)
        self.assertEqual(order_item_one.value, order_item_two.value)

    def assert_purchase_orders_are_equal(self, order_one, order_two):
        self.assertEqual(order_one.order_number, order_two.order_number)
        self.assertEqual(order_one.sales_order_id, order_two.sales_order_id)
        self.assertEqual(order_one.date, order_two.date)

    def assert_purchase_order_items_are_equal(self, order_item_one, order_item_two):
        self.assertEqual(order_item_one.purchase_order.order_number, order_item_two.purchase_order.order_number)
        self.assertEqual(order_item_one.item_number, order_item_two.item_number)
        self.assertEqual(order_item_one.sales_order_item.id, order_item_two.sales_order_item.id)