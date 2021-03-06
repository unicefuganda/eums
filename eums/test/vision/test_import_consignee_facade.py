import os
from unittest import TestCase
from mock import MagicMock
from xlwt import Workbook
from eums.models import Consignee
from eums.vision.vision_facade import ConsigneeFacade, ImportException


class TestConsigneeVisionFacade(TestCase):
    def setUp(self):
        self.consignee_file_location = 'consignees.xlsx'
        self.consignee_missing_data_file_location = 'missing_data_consignees.xlsx'
        self.create_consignee_workbook()
        self.create_consignee_workbook_with_missing_data()
        self.imported_consignee_data = [{'name': 'ADVOCATE COALITION FOR DE', 'customer_id': 'L438000582',
                                         'location': 'KAMPALA'},
                                        {'name': 'AGAGO DISTRICT PROBATION', 'customer_id': 'L438000025',
                                         'location': 'AGAGO'},
                                        {'name': 'KALAS GIRLS PRIMARY SCHOO', 'customer_id': 'L438000532',
                                         'location': 'AMUDAT'}]

        self.imported_missing_consignee_data = [{'name': 'ADVOCATE COALITION FOR DE', 'customer_id': 'L438000582',
                                                 'location': 'KAMPALA'},
                                                {'name': 'AGAGO DISTRICT PROBATION', 'customer_id': 'L438000025',
                                                 'location': 'AGAGO'}]

        self.updated_consignee_data = [{'name': 'ADVOCATE COALITION', 'customer_id': 'L438000582',
                                        'location': 'KAMPALA'},
                                       {'name': 'KILTIR DISTRICT PROBATION SERVICES', 'customer_id': 'L438000025',
                                        'location': 'AGAGO'},
                                       {'name': 'KALAS BOYS PRIMARY SCHOOL', 'customer_id': 'L438000532',
                                        'location': 'GULU'}]

        self.facade = ConsigneeFacade(self.consignee_file_location)
        self.facade_for_missing = ConsigneeFacade(self.consignee_missing_data_file_location)

    def tearDown(self):
        os.remove(self.consignee_file_location)
        os.remove(self.consignee_missing_data_file_location)
        Consignee.objects.all().delete()

    def create_consignee_workbook(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['SearchTerm', 'Name 1', 'City', 'Customer']
        self.first_row = [u'ACODE', u'ADVOCATE COALITION FOR DE', u'KAMPALA', u'L438000582']
        self.second_row = [u'AGAGO', u'AGAGO DISTRICT PROBATION', u'AGAGO', u'L438000025']
        self.third_row = [u'AMUDAT DIS', u'KALAS GIRLS PRIMARY SCHOO', u'AMUDAT', u'L438000532']

        rows = [self.header, self.first_row, self.second_row, self.third_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.consignee_file_location)

    def create_consignee_workbook_with_missing_data(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['SearchTerm', 'Name 1', 'City', 'Customer']
        self.first_row = [u'ACODE', u'ADVOCATE COALITION FOR DE', u'KAMPALA', u'L438000582']
        self.second_row = [u'AGAGO', u'AGAGO DISTRICT PROBATION', u'AGAGO', u'L438000025']
        self.third_row = [u'   ', u'', u' ', u'    ']
        self.fourth_row = [u'KOTIDO DIS', u'', u'KOTIDO', u'']
        self.fifth_row = [u'AMUDAT DIS', u' ', u'AMUDAT', u'L438000532']
        self.sixth_row = [u'JINJA DIS', u'JINJA DISTRICT PROBATION', u'AMUDAT', u' ']

        rows = [self.header, self.first_row, self.second_row, self.third_row, self.fourth_row, self.fifth_row,
                self.sixth_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.consignee_missing_data_file_location)

    def test_should_load_consignee_data(self):
        consignee_data = self.facade.load_records()
        self.assertEqual(consignee_data, self.imported_consignee_data)

    def test_should_not_load_consignee_with_missing_data(self):
        with self.assertRaises(ImportException):
            self.facade_for_missing.load_records()

    def test_should_save_consignee_data_on_save_records(self):
        self.assertEqual(Consignee.objects.count(), 0)

        consignee_data = [
            {'name': 'ADVOCATE COALITION FOR DE', 'customer_id': 'L438000582', 'location': 'KAMPALA'},
            {'name': 'AGAGO DISTRICT PROBATION', 'customer_id': 'L438000025', 'location': 'AGAGO'}]

        self.facade.save_records(consignee_data)

        self.assertEqual(Consignee.objects.count(), 2)

        db_consignee_one = Consignee.objects.get(name='ADVOCATE COALITION FOR DE')
        self.assertEqual(db_consignee_one.customer_id, 'L438000582')
        self.assertEqual(db_consignee_one.location, 'KAMPALA')

        db_consignee_two = Consignee.objects.get(name='AGAGO DISTRICT PROBATION')
        self.assertEqual(db_consignee_two.customer_id, 'L438000025')
        self.assertEqual(db_consignee_two.location, 'AGAGO')

    def test_should_update_data_for_existing_consignee_customer_data(self):
        self.assertEqual(Consignee.objects.count(), 0)
        self.facade.save_records(self.imported_consignee_data)
        self.assertEqual(Consignee.objects.count(), 3)

        self.facade.save_records(self.updated_consignee_data)
        self.assertEqual(Consignee.objects.count(), 3)

        first_consignee = Consignee.objects.get(customer_id=self.updated_consignee_data[0]['customer_id'])
        self.assertEqual(first_consignee.name,self.updated_consignee_data[0]['name'])
        self.assertEqual(first_consignee.location, self.updated_consignee_data[0]['location'])

        second_consignee = Consignee.objects.get(customer_id=self.updated_consignee_data[1]['customer_id'])
        self.assertEqual(second_consignee.name, self.updated_consignee_data[1]['name'])
        self.assertEqual(second_consignee.location, self.updated_consignee_data[1]['location'])

        third_consignee = Consignee.objects.get(customer_id=self.updated_consignee_data[2]['customer_id'])
        self.assertEqual(third_consignee.name, self.updated_consignee_data[2]['name'])
        self.assertEqual(third_consignee.location, self.updated_consignee_data[2]['location'])

    def test_should_load_consignee_from_excel_and_save(self):
        self.assertEqual(Consignee.objects.count(), 0)

        self.facade.load_records = MagicMock(return_value=self.imported_consignee_data)
        self.facade.save_records = MagicMock()

        self.facade.import_records()

        self.facade.load_records.assert_called()
        self.facade.save_records.assert_called_with(self.imported_consignee_data)

    def assert_consignees_are_equal(self, consignee_one, consignee_two):
        self.assertEqual(consignee_one.name, consignee_two.name)
        self.assertEqual(consignee_one.location, consignee_two.location)
        self.assertEqual(consignee_one.imported_from_vision, consignee_two.imported_from_vision)
        self.assertEqual(consignee_one.customer_id, consignee_two.customer_id)
        self.assertEqual(consignee_one.type, consignee_two.type)
