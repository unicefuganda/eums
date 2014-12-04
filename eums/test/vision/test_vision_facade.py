from unittest import TestCase
import os
import datetime
from decimal import Decimal

from django.contrib.auth.models import User
from mock import MagicMock
from xlwt import Workbook

from eums.models import SalesOrder, Item, SalesOrderItem, Programme, ReleaseOrder, ReleaseOrderItem, Consignee
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.vision.vision_facade import ReleaseOrderFacade, SalesOrderFacade


class TestSalesOrdersVisionFacade(TestCase):
    def setUp(self):
        self.sales_order_file_location = 'sales_orders.xlsx'
        self.create_sales_order_workbook()
        self.imported_sales_order_data = [{'order_number': 20146879,
                                           'programme_wbs_element': '4380/A0/04/105',
                                           'items': [
                                               {'material_code': u'S0009113',
                                                'item_number': u'10',
                                                'item_description': u'SQFlex 3-10 Pump C/W 1.4KW',
                                                'date': u'2014-01-03',
                                                'net_value': u'3179.47',
                                                'quantity': u'1'},
                                               {'material_code': u'SL006173',
                                                'item_number': u'20',
                                                'item_description': u'Solar Power System',
                                                'date': u'2014-01-03',
                                                'net_value': u'2638.32',
                                                'quantity': u'12'}], },

                                          {'order_number': 20147028,
                                           'programme_wbs_element': u'4380/A0/04/106',
                                           'items': [
                                               {'material_code': u'S7800001',
                                                'item_number': u'10',
                                                'item_description': u'Retinol 100,000IU soft gel.caps/PAC-500',
                                                'date': u'2014-01-09',
                                                'net_value': u'21592.3',
                                                'quantity': u'2630'}]}]

        self.facade = SalesOrderFacade(self.sales_order_file_location)

    def tearDown(self):
        os.remove(self.sales_order_file_location)
        Item.objects.all().delete()
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        Programme.objects.all().delete()
        User.objects.all().delete()

    def test_should_load_sales_order_data_excluding_summary_rows(self):
        sales_order_data = self.facade.load_order_data()
        self.assertEqual(sales_order_data, self.imported_sales_order_data)

    def test_should_save_sales_order_data(self):
        self.assertEqual(SalesOrder.objects.count(), 0)
        self.assertEqual(SalesOrderItem.objects.count(), 0)

        programme_one = ProgrammeFactory(wbs_element_ex='4380/A0/04/105')
        programme_two = ProgrammeFactory(wbs_element_ex='4380/A0/04/106')

        item_one = ItemFactory(material_code='S0009113', description='SQFlex 3-10 Pump C/W 1.4KW')
        item_two = ItemFactory(material_code='SL006173', description='Solar Power System')
        item_three = ItemFactory(material_code='S7800001', description='Retinol 100,000IU soft gel.caps/PAC-500')

        self.facade.save_order_data(self.imported_sales_order_data)

        self.assert_sales_orders_were_created(programme_one, programme_two)

        self.assert_sales_order_items_were_created(item_one, item_three, item_two)

    def test_should_set_net_price_to_zero_if_quantity_of_an_item_is_zero(self):
        ProgrammeFactory(wbs_element_ex='4380/A0/04/105')
        item_one = ItemFactory(material_code='S0009113', description='SQFlex 3-10 Pump C/W 1.4KW')

        self.facade.save_order_data([{'order_number': 20146879,
                                      'programme_wbs_element': '4380/A0/04/105',
                                      'items': [
                                          {'material_code': u'S0009113',
                                           'item_number': u'10',
                                           'item_description': u'SQFlex 3-10 Pump C/W 1.4KW',
                                           'date': u'2014-01-03',
                                           'net_value': u'3179.47',
                                           'quantity': u'0'}]}])

        order_item_one = SalesOrderItem(sales_order=SalesOrder.objects.all()[0], item_number=10, item=item_one,
                                        quantity=0, net_value=Decimal('3179.4700'), net_price=Decimal('0.00'),
                                        issue_date=datetime.date(2014, 1, 3), delivery_date=datetime.date(2014, 1, 3),
                                        description=u'SQFlex 3-10 Pump C/W 1.4KW')

        self.assert_sales_order_items_are_equal(order_item_one, SalesOrderItem.objects.all()[0])

    def test_should_load_sales_orders_from_excel_and_save(self):
        self.assertEqual(SalesOrder.objects.count(), 0)

        self.facade.load_order_data = MagicMock(return_value=self.imported_sales_order_data)
        self.facade.save_order_data = MagicMock()

        self.facade.import_orders()

        self.facade.load_order_data.assert_called()
        self.facade.save_order_data.assert_called_with(self.imported_sales_order_data)

    def assert_sales_orders_were_created(self, programme_one, programme_two):
        sales_order_one = SalesOrder(order_number=20146879, programme=programme_one,
                                     date=datetime.date(2014, 1, 3))
        sales_order_two = SalesOrder(order_number=20147028, programme=programme_two,
                                     date=datetime.date(2014, 1, 9))

        self.assert_sales_orders_are_equal(sales_order_one, SalesOrder.objects.all()[0])
        self.assert_sales_orders_are_equal(sales_order_two, SalesOrder.objects.all()[1])

    def assert_sales_order_items_were_created(self, item_one, item_three, item_two):
        order_item_one = SalesOrderItem(sales_order=SalesOrder.objects.all()[0], item_number=10, item=item_one,
                                        quantity=1, net_value=Decimal('3179.4700'), net_price=Decimal('3179.4700'),
                                        issue_date=datetime.date(2014, 1, 3), delivery_date=datetime.date(2014, 1, 3),
                                        description=u'SQFlex 3-10 Pump C/W 1.4KW')
        order_item_two = SalesOrderItem(sales_order=SalesOrder.objects.all()[0], item_number=20, item=item_two,
                                        quantity=12, net_value=Decimal('2638.32'), net_price=Decimal('219.86'),
                                        issue_date=datetime.date(2014, 1, 3), delivery_date=datetime.date(2014, 1, 3),
                                        description=u'Solar Power System')
        order_item_three = SalesOrderItem(sales_order=SalesOrder.objects.all()[1], item_number=10, item=item_three,
                                          quantity=2630, net_value=Decimal('21592.3'), net_price=Decimal('8.21'),
                                          issue_date=datetime.date(2014, 1, 9), delivery_date=datetime.date(2014, 1, 9),
                                          description=u'Retinol 100,000IU soft gel.caps/PAC-500')

        self.assert_sales_order_items_are_equal(order_item_one, SalesOrderItem.objects.all()[0])
        self.assert_sales_order_items_are_equal(order_item_two, SalesOrderItem.objects.all()[1])
        self.assert_sales_order_items_are_equal(order_item_three, SalesOrderItem.objects.all()[2])

    def assert_sales_orders_are_equal(self, order_one, order_two):
        self.assertEqual(order_one.order_number, order_two.order_number)
        self.assertEqual(order_one.programme_id, order_two.programme_id)
        self.assertEqual(order_one.date, order_two.date)
        self.assertEqual(order_one.description, order_two.description)

    def assert_sales_order_items_are_equal(self, order_item_one, order_item_two):
        self.assertEqual(order_item_one.sales_order_id, order_item_two.sales_order_id)
        self.assertEqual(order_item_one.item_number, order_item_two.item_number)
        self.assertEqual(order_item_one.item_id, order_item_two.item_id)
        self.assertEqual(order_item_one.quantity, order_item_two.quantity)
        self.assertEqual(order_item_one.issue_date, order_item_two.issue_date)
        self.assertEqual(order_item_one.delivery_date, order_item_two.delivery_date)
        self.assertEqual(order_item_one.net_price, order_item_two.net_price)
        self.assertEqual(order_item_one.net_value, order_item_two.net_value)
        self.assertEqual(order_item_one.description, order_item_two.description)

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

        self.first_row = [20146879, '10', 'S0009113', '1', '1', '3179.47', 'Emergency:Kyangwali', '2014-01-03',
                          '2014', '2014-01-03', 'SQFlex 3-10 Pump C/W 1.4KW', '438', 'UGANDA', '4380/A0/04/105/007/020',
                          'SM130359' '', '0', '0', '0', '0 ', '0', '3179.47', '', '', '@02@', '', 'Yes', 'No', '0',
                          '0', '0', '2953.79', '']

        self.second_row = [20146879, '20', 'SL006173', '12', '12', '2638.32', 'Emergency:Kyangwali', '2014-01-03',
                           '2014', '2014-01-03', 'Solar Power System', '438', 'UGANDA',
                           '4380/A0/04/105/007/020', 'SM130359' '', '0', '0', '0', '0 ', '0', '2638.32', '', '',
                           '@02@', '', 'Yes', 'No', '0', '0', '0', '2451.02', '']

        self.third_row = [20147028, '10', 'S7800001', '2630', '2630', '21592.3', '1.4 IKA Vitamin A', '2014-01-09',
                          '2014', '2014-01-09', 'Retinol 100,000IU soft gel.caps/PAC-500', '438', 'UGANDA',
                          '4380/A0/04/106/004/010', 'KC130014' '', '2630', '20476.4', '2630', '0 ', '0', '1115.9', '',
                          '', '@DF@', '', 'Yes', 'No', '0', '0', '0', '20487.7', '']

        self.summary_row = [20147028, '', '', '', '', '21592.3', '', '', '', '', '', '', '', '', '' '', '', '20476.4',
                            '', '0', '0', '1115.9', '', '', '', '', '', '', '', '', '', '', '']

        rows = [self.header, self.first_row, self.second_row, self.third_row, self.summary_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.sales_order_file_location)


class TestReleaseOrdersVisionFacade(TestCase):
    def setUp(self):
        self.release_order_file_location = 'release_orders.xlsx'

        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['Release Order Number', 'Release Order Item', 'Release Order Date', 'Recommended Delivery Date',
                       'Material', 'Material Description', 'Delivery Quantity', 'Value', 'Storage Location',
                       'Warehouse Number', 'Warehouse Description', 'Consignee', 'Consignee Name', 'Authorized Person',
                       'Sales Document', 'Purchasing Document', 'Delivery', 'Grant', 'WBS Element', 'Pick Status',
                       'Transfer Order Number', 'Transportation Planning Status', 'Waybill Number', 'Forwarder Name',
                       'Shipment End Date', 'Goods Issue Status', 'Goods Issue Date', 'Release Order Sub-Item',
                       'HigherLevelItemBatch', 'Release Order Type', 'Sales unit', 'Moving price', 'Plant',
                       'Plant Name', 'Storage Location Desc', 'Dest Warehouse Number', 'Dest Warehouse Description',
                       'Ship-to party', 'Means of Trans. ID', 'Program Officer', 'Sales Document Item',
                       'Purchasing Item', 'Reference document', 'Reference item', 'Delivery Item',
                       'Transfer Order Item', 'Forwarder Number', 'Goods Issue Number', 'Goods Issue Item', 'Batch',
                       'SLED/BBD', 'Actual End Planning Date', 'Check-in Date', 'Planned Shipment Start Date',
                       'Loading Start Date', 'Loading End Date', 'Actual Shipment Start Date',
                       'Shipment Completion Date', 'Shipment Days Difference', 'Goods Issue Days Difference',
                       'Handed-Over to IP Planned', 'Handed-Over to IP', 'Reason for Amendment', 'RO User Reference 1',
                       'RO User Reference 2', 'RO User Reference 3', 'RO User Reference 4', 'RO User Reference 5',
                       'WB User Reference 1', 'WB User Reference 2', 'WB User Reference 3', 'WB User Reference 4',
                       'WB User Reference 5']

        self.first_row = ['54101099', '10', '08/01/2014', '08/01/2014', 'SL005144', 'Laptop Lenovo ThinkPad T510', '1',
                          '1167.66', '2611', '261', 'Kampala W1', 'L438000393', 'OYAM DISTRICT ADMIN',
                          'Nuhoddin Maarij', '20148031', '81018523', '56162712', 'SC130003', '4380/A0/04/107/002/012',
                          'C', '7732', 'C', '72081598', 'UNICEF - Kampala Uganda Kampala Country Office Uganda',
                          '08/05/2014', 'C', '8/20/2014', '0', '0', 'ZLO', 'EA', '1167.67', '5617', 'Uganda',
                          'Kampala W1-Prog', '', '', 'L438000393', '', 'Silvia Pasti', '10', '10', '', '1', '1', '1',
                          'F43801', '4900086016', '1', 'SYS0084421', '', '08/05/2014', '08/05/2014', '', '08/05/2014',
                          '08/05/2014', '08/05/2014', '08/05/2014', '', '15', '', '', '', '', '', '', '', '',
                          'CD 96-50U', 'UNICEF', 'Bongomin', '', '']
        self.second_row = ['54101099', '20', '08/01/2014', '08/01/2014', 'SL002248', 'Laptop bag', '1', '26.81', '2611',
                           '261', 'Kampala W1', 'L438000393', 'OYAM DISTRICT ADMIN', 'Nuhoddin Maarij', '20148031',
                           '81018523', '56162712', 'SC130003', '4380/A0/04/107/002/012', 'C', '7732', 'C', '72081598',
                           'UNICEF - Kampala Uganda Kampala Country Office Uganda', '08/05/2014', 'C', '8/20/2014', '0',
                           '0', 'ZLO', 'EA', '26.81', '5617', 'Uganda', 'Kampala W1-Prog', '', '', 'L438000393', '',
                           'Silvia Pasti', '20', '20', '', '2', '2', '2', 'F43801', '4900086016', '2', 'SYS0084422', '',
                           '08/05/2014', '08/05/2014', '', '08/05/2014', '08/05/2014', '08/05/2014', '08/05/2014', '',
                           '15', '', '', '', '', '', '', '', '', 'CD 96-50U', 'UNICEF', 'Bongomin', '', '']
        self.third_row = ['54101128', '20', '08/01/2014', '08/04/2014', 'S0000208',
                          'F-75 therap.diet sachet 102.5g/CAR-120', '20', '1188.79', '2611', '261', 'Kampala W1',
                          'L438000181', 'GULU HOSPITAL', 'NUHODDIN MAARIJ', '20147537', '45132639', '56165211',
                          'SC130708', '4380/A0/04/105/004/022', 'C', '7665', 'C', '72081746',
                          'Express Logistics Group Ltd.', '08/07/2014', 'C', '8/20/2014', '0', '0', 'ZLO', 'CAR',
                          '59.44', '5617', 'Uganda', 'Kampala W1-Prog', '', '', 'L438000181', '', 'PRAKASH LAMSAL',
                          '20', '20', '', '2', '2', '2', '2300027179', '4900086015', '2', '100314', '3/31/2016',
                          '08/07/2014', '08/07/2014', '', '08/07/2014', '08/07/2014', '08/07/2014', '08/07/2014', '',
                          '13', '', '', '', '', '', '', '', '', 'UAN 853F', 'EXPRESS LOGISTICS', '2MT', 'SAMUEL', '']
        for row_index, row in enumerate([self.header, self.first_row, self.second_row, self.third_row]):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.release_order_file_location)

        self.facade = ReleaseOrderFacade(self.release_order_file_location)

        self.order_data = [{'order_number': '54101099',
                            'sales_order': '20148031',
                            'consignee': 'L438000393',
                            'waybill': '72081598',
                            'recommended_delivery_date': '08/01/2014',
                            'items': [{'material_code': 'SL005144',
                                       'description': 'Laptop Lenovo ThinkPad T510',
                                       'quantity': '1',
                                       'value': '1167.66',
                                       'purchase_order': '81018523',
                                       'order_number': '54101099',
                                       'waybill': '72081598',
                                       'sales_order': '20148031',
                                       'consignee': 'L438000393',
                                       'recommended_delivery_date': '08/01/2014'},
                                      {'material_code': 'SL002248',
                                       'description': 'Laptop bag',
                                       'quantity': '1',
                                       'value': '26.81',
                                       'purchase_order': '81018523',
                                       'order_number': '54101099',
                                       'waybill': '72081598',
                                       'sales_order': '20148031',
                                       'consignee': 'L438000393',
                                       'recommended_delivery_date': '08/01/2014'}]},
                           {'order_number': '54101128',
                            'sales_order': '20147537',
                            'consignee': 'L438000181',
                            'waybill': '72081746',
                            'recommended_delivery_date': '08/04/2014',
                            'items': [{'material_code': 'S0000208',
                                       'description': 'F-75 therap.diet sachet 102.5g/CAR-120',
                                       'quantity': '20',
                                       'value': '1188.79',
                                       'purchase_order': '45132639',
                                       'order_number': '54101128',
                                       'waybill': '72081746',
                                       'sales_order': '20147537',
                                       'consignee': 'L438000181',
                                       'recommended_delivery_date': '08/04/2014'}]}]

    def tearDown(self):
        os.remove(self.release_order_file_location)
        ReleaseOrderItem.objects.all().delete()
        ReleaseOrder.objects.all().delete()
        Item.objects.all().delete()
        SalesOrder.objects.all().delete()
        Consignee.objects.all().delete()

    def xtest_can_load_release_order_data(self):
        release_order_data = self.facade.load_order_data()

        self.assertEqual(release_order_data, self.order_data)

    def xtest_save_release_order_data(self):
        SalesOrderFactory(order_number='20148031')
        SalesOrderFactory(order_number='20147537')

        ConsigneeFactory(customer_id='L438000393')
        ConsigneeFactory(customer_id='L438000181')

        ItemFactory(material_code='SL005144')
        ItemFactory(material_code='SL002248')
        ItemFactory(material_code='S0000208')

        self.facade.save_order_data(self.order_data)

        self.assertEqual(ReleaseOrder.objects.count(), 2)
        self.assertEqual(ReleaseOrderItem.objects.count(), 3)

        first_order = ReleaseOrder.objects.get(order_number='54101099')
        self.assertEqual(first_order.waybill, '72081598')
        self.assertEqual(first_order.sales_order.order_number, '20148031')
        formatted_date = first_order.delivery_date.strftime("%m/%d/%Y")
        self.assertEqual(formatted_date, '08/01/2014')
        self.assertEqual(first_order.consignee.customer_id, 'L438000393')
        first_item = first_order.releaseorderitem_set.first()
        self.assertEqual(first_item.item.material_code, 'SL005144')
        self.assertEqual(first_item.purchase_order, '81018523')
        self.assertEqual(str(first_item.value), '1167.66')
        self.assertEqual(str(int(first_item.quantity)), '1')

        last_order = ReleaseOrder.objects.get(order_number='54101128')
        self.assertEqual(last_order.waybill, '72081746')
        self.assertEqual(last_order.sales_order.order_number, '20147537')
        formatted_date = last_order.delivery_date.strftime("%m/%d/%Y")
        self.assertEqual(formatted_date, '08/04/2014')
        self.assertEqual(last_order.consignee.customer_id, 'L438000181')
        last_item = last_order.releaseorderitem_set.first()
        self.assertEqual(last_item.item.material_code, 'S0000208')
        self.assertEqual(last_item.purchase_order, '45132639')
        self.assertEqual(str(last_item.value), '1188.79')
        self.assertEqual(str(int(last_item.quantity)), '20')

    def test_should_load_release_orders_from_excel_and_save(self):
        self.facade.load_order_data = MagicMock(return_value=self.order_data)
        self.facade.save_order_data = MagicMock(return_value=None)

        self.facade.import_orders()

        self.facade.load_order_data.assert_called_with()
        self.facade.save_order_data.assert_called_with(self.order_data)



