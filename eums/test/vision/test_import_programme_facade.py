import os
from unittest import TestCase
from mock import MagicMock
from xlwt import Workbook
from eums.models import Programme
from eums.vision.vision_facade import ProgrammeFacade, ImportException


class TestProgrammeVisionFacade(TestCase):
    def setUp(self):
        self.programme_file_location = 'programmes.xlsx'
        self.programme_file_with_missing_data_location = 'programmes_with_missing_data.xlsx'
        self.create_programme_workbook()
        self.create_programme_workbook_with_missing_data()
        self.imported_programme_data = [{'name': 'YI107 - PCR 3 KEEP CHILDREN SAFE', 'wbs_element_ex': '4380/A0/04/107'},
                                        {'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS', 'wbs_element_ex': '4380/A0/04/105'},
                                        {'name': 'Y108 - PCR 4 CROSS SECTORAL', 'wbs_element_ex': '4380/A0/04/108'},
                                        {'name': 'YP109 - PCR 5 SUPPORT', 'wbs_element_ex': '4380/A0/04/800'}
                                        ]

        self.imported_missing_programme_data = [
                                        {'name': 'Y108 - PCR 4 CROSS SECTORAL', 'wbs_element_ex': '4380/A0/04/108'}
                                        ]

        self.updated_programme_data = [{'name': 'YI107 - PCR 3 KEEP CHILDREN SAFE ALWAYS', 'wbs_element_ex': '4380/A0/04/107'},
                                       {'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS SAFE', 'wbs_element_ex': '4380/A0/04/105'},
                                       ]

        self.facade = ProgrammeFacade(self.programme_file_location)
        self.facade_for_missing = ProgrammeFacade(self.programme_file_with_missing_data_location)

    def tearDown(self):
        os.remove(self.programme_file_location)
        os.remove(self.programme_file_with_missing_data_location)
        Programme.objects.all().delete()

    def create_programme_workbook(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['BUSINESS_AREA_NAME', 'PCR_NO', 'PCR_NAME', 'WBS_ELEMENT_EX']
        self.first_row = [u'Uganda', u'107', u'YI107 - PCR 3 KEEP CHILDREN SAFE', u'4380/A0/04/107']
        self.second_row = [u'Uganda', u'105', u'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS', u'4380/A0/04/105']
        self.third_row = [u'Uganda', u'108', u'Y108 - PCR 4 CROSS SECTORAL', u'4380/A0/04/108']
        self.fourth_row = [u'Uganda', u'800', u'YP109 - PCR 5 SUPPORT', u'4380/A0/04/800']

        rows = [self.header, self.first_row, self.second_row, self.third_row, self.fourth_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.programme_file_location)

    def create_programme_workbook_with_missing_data(self):
        work_book = Workbook()
        sheet = work_book.add_sheet('Sheet 1')

        self.header = ['BUSINESS_AREA_NAME', 'PCR_NO', 'PCR_NAME', 'WBS_ELEMENT_EX']
        self.first_row = [u'Uganda', u'107', u' ', u'4380/A0/04/107']
        self.second_row = [u'Uganda', u'105', u'', u' ']
        self.third_row = [u'Uganda', u'108', u'Y108 - PCR 4 CROSS SECTORAL', u'4380/A0/04/108']
        self.fourth_row = [u'Uganda', u'800', u'YP109 - PCR 5 SUPPORT', u'']

        rows = [self.header, self.first_row, self.second_row, self.third_row, self.fourth_row]

        for row_index, row in enumerate(rows):
            for col_index, item in enumerate(row):
                sheet.write(row_index, col_index, item)

        work_book.save(self.programme_file_with_missing_data_location)

    def test_should_load_programme_data(self):
        programme_data = self.facade.load_records()

        self.assertEqual(programme_data, self.imported_programme_data)

    def test_should_not_load_programme_with_missing_data(self):
        with self.assertRaises(ImportException):
            self.facade_for_missing.load_records()

    def test_should_save_programme_data(self):
        self.assertEqual(Programme.objects.count(), 0)
        self.facade.save_records(self.imported_programme_data)

        self.assert_programmes_were_created()

    def test_should_update_name_for_existing_programme_wbs_element_ex_data(self):
        self.assertEqual(Programme.objects.count(), 0)
        self.facade.save_records(self.imported_programme_data)
        self.assertEqual(Programme.objects.count(), 4)

        self.facade.save_records(self.updated_programme_data)
        self.assertEqual(Programme.objects.count(), 4)
        self.assertEqual(Programme.objects.get(wbs_element_ex=self.updated_programme_data[0]['wbs_element_ex']).name, self.updated_programme_data[0]['name'])
        self.assertEqual(Programme.objects.get(wbs_element_ex=self.updated_programme_data[1]['wbs_element_ex']).name, self.updated_programme_data[1]['name'])

    def test_should_load_programme_from_excel_and_save(self):
        self.assertEqual(Programme.objects.count(), 0)

        self.facade.load_records = MagicMock(return_value=self.imported_programme_data)
        self.facade.save_records = MagicMock()

        self.facade.import_records()

        self.facade.load_records.assert_called()
        self.facade.save_records.assert_called_with(self.imported_programme_data)

    def assert_programmes_were_created(self):
        programme_one = Programme(name='YI107 - PCR 3 KEEP CHILDREN SAFE', wbs_element_ex='4380/A0/04/107')
        programme_two = Programme(name='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS', wbs_element_ex='4380/A0/04/105')
        programme_three = Programme(name='Y108 - PCR 4 CROSS SECTORAL', wbs_element_ex='4380/A0/04/108')

        self.assert_programmes_are_equal(programme_one, Programme.objects.all()[0])
        self.assert_programmes_are_equal(programme_two, Programme.objects.all()[1])
        self.assert_programmes_are_equal(programme_three, Programme.objects.all()[2])

    def assert_programmes_are_equal(self, programme_one, programme_two):
        self.assertEqual(programme_one.name, programme_two.name)
        self.assertEqual(programme_one.wbs_element_ex, programme_two.wbs_element_ex)