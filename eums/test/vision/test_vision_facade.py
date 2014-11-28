from unittest import TestCase
import os
import datetime

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
        ProgrammeFactory(name='ALIVE')

        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['order_number', 'material_code', 'material_description', 'quantity',
                       'net_value', 'net_price', 'date', 'issue_date', 'delivery_date', 'programme_name']

        self.first_row = ['20150432', 'SL001894', 'Helmet', '4.00', '12.123', '2.0', datetime.datetime(2014, 2, 18),
                          datetime.datetime(2014, 2, 18), datetime.datetime(2014, 2, 18), 'ALIVE']

        self.second_row = ['20152484', 'X0001', 'This is a desc', '4.00', '12.123', '2.0',
                           datetime.datetime(2014, 2, 18),
                           datetime.datetime(2014, 2, 18), datetime.datetime(2014, 2, 18),
                           'Y108 - PCR 4 CROSS SECTORAL']

        self.third_row = ['20150432', 'SL753725', 'TVs for Comms unit office', '4.00', '12.123', '2.0',
                          datetime.datetime(2014, 2, 18), datetime.datetime(2014, 2, 18),
                          datetime.datetime(2014, 2, 18),
                          'YI107 - PCR 3 KEEP CHILDREN SAFE']

        for row_index, row in enumerate([self.header, self.first_row, self.second_row, self.third_row]):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.sales_order_file_location)

        self.facade = SalesOrderFacade(self.sales_order_file_location)

    def tearDown(self):
        os.remove(self.sales_order_file_location)
        Item.objects.all().delete()
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        Programme.objects.all().delete()
        User.objects.all().delete()

    def test_should_load_sales_order_data(self):

        expected_data = [{'order_number': '20150432',
                          'programme_name': 'ALIVE',
                          'items': [
                              {'issue_date': '2014-09-22 00:00:00', 'material_code': 'SL001894', 'net_price': '12.123',
                               'programme_name': 'ALIVE',
                               'item_description': 'Helmet',
                               'delivery_date': '2014-09-22 00:00:00', 'date': '2014-09-22 00:00:00',
                               'order_number': '20150432',
                               'net_value': '2.0',
                               'quantity': '4.00'},
                              {'issue_date': '2014-09-22 00:00:00', 'material_code': 'SL753725', 'net_price': '12.123',
                               'programme_name': 'YI107 - PCR 3 KEEP CHILDREN SAFE',
                               'item_description': 'TVs for Comms unit office', 'delivery_date': '2014-09-22 00:00:00',
                               'date': '2014-09-22 00:00:00', 'order_number': '20150432', 'net_value': '2.0',
                               'quantity': '4.00'}], },

                         {'order_number': '20152484',
                          'programme_name': 'Y108 - PCR 4 CROSS SECTORAL',
                          'items': [
                              {'issue_date': '2014-09-22 00:00:00', 'material_code': 'X0001', 'net_price': '12.123',
                               'programme_name': 'Y108 - PCR 4 CROSS SECTORAL',
                               'item_description': 'This is a desc', 'delivery_date': '2014-09-22 00:00:00',
                               'date': '2014-09-22 00:00:00', 'order_number': '20152484', 'net_value': '2.0',
                               'quantity': '4.00'}],
                         }]

        sales_order_data = self.facade.load_order_data()
        self.assertEqual(sales_order_data, expected_data)

    def xtest_should_save_sales_order_data(self):
        self.assertEqual(SalesOrder.objects.count(), 0)
        self.assertEqual(SalesOrderItem.objects.count(), 0)

        ItemFactory(material_code='SL004594')
        ItemFactory(material_code='SL006645')

        sales_order_data = [{'order_number': '20155548',
                             'programme_name': 'ALIVE',
                             'items': [
                                 {'material_code': 'SL004594', 'quantity': '224,000',
                                  'date': datetime.datetime(2014, 2, 18),
                                  'issue_date': datetime.datetime(2014, 2, 18),
                                  'delivery_date': datetime.datetime(2014, 2, 18), 'net_price': '0.19',
                                  'programme_name': 'ALIVE',
                                  'item_description': 'Helmet',
                                  'net_value': '42,560.00', 'order_number': '20155548'}]},
                            {'order_number': '20155981',
                             'programme_name': 'ALIVE',
                             'items': [
                                 {'material_code': 'SL006645', 'quantity': '224,000',
                                  'date': datetime.datetime(2014, 2, 18),
                                  'issue_date': datetime.datetime(2014, 2, 18),
                                  'delivery_date': datetime.datetime(2014, 2, 18), 'net_price': '0.19',
                                  'programme_name': 'ALIVE',
                                  'item_description': 'This is a desc',
                                  'net_value': '42,560.00', 'order_number': '20155981'},
                                 {'material_code': 'SL004594', 'quantity': '224,000',
                                  'date': datetime.datetime(2014, 2, 18),
                                  'delivery_date': datetime.datetime(2014, 2, 18), 'net_price': '0.19',
                                  'programme_name': 'ALIVE',
                                  'issue_date': datetime.datetime(2014, 2, 18),
                                  'item_description': 'TVs for Comms unit office',
                                  'net_value': '42,560.00', 'order_number': '20155981'}]}]

        self.facade.save_order_data(sales_order_data)

        self.assertEqual(SalesOrder.objects.count(), 2)
        self.assertEqual(SalesOrderItem.objects.count(), 3)

    def xtest_should_load_sales_orders_from_excel_and_save(self):
        self.assertEqual(SalesOrder.objects.count(), 0)

        ItemFactory(material_code='SL001894')
        ItemFactory(material_code='X0001')
        ItemFactory(material_code='SL753725')

        self.facade.import_orders()

        self.assertEqual(SalesOrder.objects.count(), 2)
        self.assertEqual(SalesOrderItem.objects.count(), 3)


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

    def test_can_load_release_order_data(self):
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



