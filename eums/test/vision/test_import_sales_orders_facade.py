from unittest import TestCase
import os
import datetime
from decimal import Decimal

from django.contrib.auth.models import User
from mock import MagicMock
from xlwt import Workbook

from eums.models import SalesOrder, Item, SalesOrderItem, Programme
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
from eums.vision.vision_facade import SalesOrderFacade, ImportException


class TestSalesOrdersVisionFacade(TestCase):
    def setUp(self):
        self.sales_order_file_location = 'sales_orders.xlsx'
        self.sales_order_with_missing_data_file_location = 'sales_with_missing_orders.xlsx'
        self.create_sales_order_workbook()
        self.create_sales_order_missing_data_workbook()
        self.imported_sales_order_data = [{'order_number': 20146879,
                                           'programme_wbs_element': '4380/A0/04/105/007',
                                           'items': [
                                               {'material_code': 'S0009113',
                                                'item_number': 10,
                                                'item_description': 'SQFlex 3-10 Pump C/W 1.4KW',
                                                'date': '2014-01-03',
                                                'net_value': 3179.47,
                                                'quantity': 1},
                                               {'material_code': 'SL006173',
                                                'item_number': 20,
                                                'item_description': 'Solar Power System',
                                                'date': '2014-01-03',
                                                'net_value': 2638.32,
                                                'quantity': 12}], },

                                          {'order_number': 20147028,
                                           'programme_wbs_element': '4380/A0/04/106/004',
                                           'items': [
                                               {'material_code': 'S7800001',
                                                'item_number': 10,
                                                'item_description': 'Retinol 100,000IU soft gel.caps/PAC-500',
                                                'date': '2014-01-09',
                                                'net_value': 21592.3,
                                                'quantity': 2630}]}]

        self.updated_imported_sales_order_data = [{'order_number': 20146879,
                                                   'programme_wbs_element': '4380/A0/04/105/007',
                                                   'items': [
                                                       {'material_code': 'S0009113',
                                                        'item_number': 10,
                                                        'item_description': 'SQFlex 3-10 Pump C/W 1.4KW',
                                                        'date': '2014-01-04',
                                                        'net_value': 6358.94,
                                                        'quantity': 2},
                                                       {'material_code': 'SL006173',
                                                        'item_number': 20,
                                                        'item_description': 'Solar Power System',
                                                        'date': '2014-01-03',
                                                        'net_value': 2638.32,
                                                        'quantity': 12}], },

                                                  {'order_number': 20147028,
                                                   'programme_wbs_element': '4380/A0/04/106/004',
                                                   'items': [
                                                       {'material_code': 'S7800001',
                                                        'item_number': 10,
                                                        'item_description': 'Retinol 100,000IU soft gel.caps/PAC-500',
                                                        'date': '2014-01-09',
                                                        'net_value': 21592.3,
                                                        'quantity': 2630}]}]

        self.facade = SalesOrderFacade(self.sales_order_file_location)
        self.missing_data_facade = SalesOrderFacade(self.sales_order_with_missing_data_file_location)

    def tearDown(self):
        os.remove(self.sales_order_file_location)
        os.remove(self.sales_order_with_missing_data_file_location)
        Item.objects.all().delete()
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()
        Programme.objects.all().delete()
        User.objects.all().delete()

    def test_should_load_sales_order_data_excluding_summary_rows(self):
        sales_order_data = self.facade.load_records()

        self.assertEqual(sales_order_data, self.imported_sales_order_data)

    def test_should_not_load_sales_orders_with_missing_data(self):
        with self.assertRaises(ImportException):
            self.missing_data_facade.load_records()

    def create_items(self):
        self.item_one = ItemFactory(material_code='S0009113', description='SQFlex 3-10 Pump C/W 1.4KW')
        self.item_two = ItemFactory(material_code='SL006173', description='Solar Power System')
        self.item_three = ItemFactory(material_code='S7800001', description='Retinol 100,000IU soft gel.caps/PAC-500')

    def create_programmes(self):
        self.programme_one = ProgrammeFactory(wbs_element_ex='4380/A0/04/105/007')
        self.programme_two = ProgrammeFactory(wbs_element_ex='4380/A0/04/106/004')

    def test_should_save_sales_order_data(self):
        self.assertEqual(SalesOrder.objects.count(), 0)
        self.assertEqual(SalesOrderItem.objects.count(), 0)

        self.create_programmes()
        self.create_items()

        self.facade.save_records(self.imported_sales_order_data)

        self.assert_sales_orders_were_created(self.programme_one, self.programme_two)
        self.assert_sales_order_items_were_created(self.item_one, self.item_three, self.item_two)

    def test_should_load_sales_orders_from_excel_and_save(self):
        self.assertEqual(SalesOrder.objects.count(), 0)

        self.facade.load_records = MagicMock(return_value=self.imported_sales_order_data)
        self.facade.save_records = MagicMock()

        self.facade.import_records()

        self.facade.load_records.assert_called()
        self.facade.save_records.assert_called_with(self.imported_sales_order_data)

    def test_should_update_existing_sales_orders_when_saving_only_matching_by_order_number(self):
        self.create_programmes()
        self.create_items()

        self.facade.save_records(self.imported_sales_order_data)
        self.assertEqual(SalesOrder.objects.count(), 2)

        first_sales_order = SalesOrder.objects.all().first()
        first_sales_order.date = datetime.date(2100, 01, 13)
        first_sales_order.save()

        self.facade.save_records(self.updated_imported_sales_order_data)
        self.assertEqual(SalesOrder.objects.count(), 2)
        self.assertEqual(SalesOrderItem.objects.count(), 3)

        expected_order_item = SalesOrderItem(sales_order=first_sales_order, item_number=10,
                                             item=Item.objects.all()[0], quantity=2,
                                             net_value=Decimal('6358.9400'), net_price=Decimal('3179.4700'),
                                             issue_date=datetime.date(2014, 1, 4),
                                             delivery_date=datetime.date(2014, 1, 4),
                                             description=u'SQFlex 3-10 Pump C/W 1.4KW')

        item = SalesOrderItem.objects.get(description='SQFlex 3-10 Pump C/W 1.4KW', sales_order=first_sales_order)
        self.assertEqual(expected_order_item, item)

    def test_should_create_sales_order_items_with_different_item_numbers(self):
        num_sales_order_imports = SalesOrderItem.objects.count()

        sales_order_facade = SalesOrderFacade('some/location')
        item = ItemFactory(material_code='MYCODE123', description='Some Description')
        sales_order = SalesOrderFactory()

        SalesOrderItemFactory(
            item=item,
            item_number=200,
            sales_order=sales_order)

        sales_order_item_row = {
            'item_number': 220,
            'material_code': 'MYCODE123',
            'item_description': 'Some Description',
            'date': '2015-8-5',
            'net_value': 250.0,
            'quantity': 5.0}

        sales_order_facade._create_new_item(sales_order_item_row, sales_order)

        self.assertEqual(num_sales_order_imports + 2, SalesOrderItem.objects.count())

    def test_should_match_sales_order_items_with_same_item_and_sales_order_and_item_number(self):
        self.create_programmes()
        self.create_items()

        self.facade.save_records(self.imported_sales_order_data)
        self.assertEqual(SalesOrderItem.objects.count(), 3)

        first_sales_order_item = SalesOrderItem.objects.all().first()
        first_sales_order_item.item_number = -13
        first_sales_order_item.save()

        self.facade.save_records(self.imported_sales_order_data)
        self.assertEqual(SalesOrderItem.objects.count(), 4)

    def test_should_set_net_price_to_zero_if_quantity_of_an_item_is_zero(self):
        ProgrammeFactory(wbs_element_ex='4380/A0/04/105/007')
        item_one = ItemFactory(material_code='S0009113', description='SQFlex 3-10 Pump C/W 1.4KW')

        self.facade.save_records([{'order_number': 20146879,
                                      'programme_wbs_element': '4380/A0/04/105/007',
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

        self.assertEqual(order_item_one, SalesOrderItem.objects.first())

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

        sales_order_items = SalesOrderItem.objects.all()
        self.assertIn(order_item_one, sales_order_items)
        self.assertIn(order_item_two, sales_order_items)
        self.assertIn(order_item_three, sales_order_items)

    def assert_sales_orders_are_equal(self, order_one, order_two):
        self.assertEqual(order_one.order_number, order_two.order_number)
        self.assertEqual(order_one.programme_id, order_two.programme_id)
        self.assertEqual(order_one.date, order_two.date)
        self.assertEqual(order_one.description, order_two.description)

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
                          u'SM130359' u'fhdd-sjs', u'0', u'0', u'0', u'0 ', u'0', u'3179.47', u'1', u'1', u'@02', u'dk', u'Yes',
                          u'No', u'0',
                          u'0', u'0', u'2953.79', u'76088583']

        self.second_row = [20146879, '20', 'SL006173', '12', '12', '2638.32', 'Emergency:Kyangwali', '2014-01-03',
                           '2014', '2014-01-03', 'Solar Power System', '438', 'UGANDA',
                           '4380/A0/04/105/007/020', 'SM130359', '1', '0', '0', '0', '0 ', '0', '2638.32', '1', '1',
                           '@02@', '1', 'Yes', 'No', '0', '0', '0', '2451.02', '76088583']

        self.third_row = [20147028, '10', 'S7800001', '2630', '2630', '21592.3', '1.4 IKA Vitamin A', '2014-01-09',
                          '2014', '2014-01-09', 'Retinol 100,000IU soft gel.caps/PAC-500', '438', 'UGANDA',
                          '4380/A0/04/106/004/010', 'KC130014', '1', '2630', '20476.4', '2630', '0 ', '0', '1115.9', '1',
                          '1', '@DF@', 'cvg', 'Yes', 'No', '0', '0', '0', '20487.7', '76088583']

        self.summary_row = [20147028, '', '', '', '', '21592.3', '', '', '', '', '', '', '', '', '' '', '', '20476.4',
                            '', '0', '0', '1115.9', '', '', '', '', '', '', '', '', '', '', '']

        rows = [self.header, self.first_row, self.second_row, self.third_row, self.summary_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.sales_order_file_location)

    def create_sales_order_missing_data_workbook(self):
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

            self.first_row = [u'20146879', u'10', u'S0009145', u'1', u'1', u'3179.47', u'Emergency:Kyangwali',
                              u'2014-01-03',
                              u'2014', u'2014-01-03', u' ', u'438', u'UGANDA',
                              u'4380/A0/04/105/007/020',
                              u'SM130359' u'', u'0', u'0', u'0', u'', u'0', u'3179.47', u'', u'', u'@02@', u'', u'Yes',
                              u'No', u'0',
                              u'0', u'0', u'2953.79', u'']

            self.second_row = [20147028, '', '', '', '', '', '', '', '', '', '', '', '', '', '' '', '', '20476.4',
                                '', '0', '0', '1115.9', '', '', '', '', '', '', '', '', '', '', '']

            rows = [self.header, self.first_row, self.second_row]

            for row_index, row in enumerate(rows):
                for col_index, item in enumerate(row):
                    sheet.write(row_index, col_index, item)

            work_book.save(self.sales_order_with_missing_data_file_location)