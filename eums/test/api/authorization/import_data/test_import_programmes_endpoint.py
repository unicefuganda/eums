from eums.models import Programme
from eums.test.api.api_test_helpers import create_user_with_group
import os
from rest_framework.test import APITestCase
from xlwt import Workbook
from eums.management.commands.setup_permissions import Command


class TestImportProgrammesEndpoint(APITestCase):
    def setUp(self):
        self.programme_file_location = 'programmes.xlsx'
        self.create_programme_workbook()
        Command().handle()

    def tearDown(self):
        os.remove(self.programme_file_location)
        Programme.objects.all().delete()

    def test_should_allow_authorised_user_to_import_consignees(self):
        username = 'unicef_admin1'
        password = 'password'

        create_user_with_group(username=username, password=password, email='admin@email.com', group='UNICEF_admin')

        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.programme_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-programmes/', FILES)

            self.assertEqual(response.status_code, 200)
            wbs_elements = [programme.wbs_element_ex for programme in Programme.objects.all()]
            self.assertEqual(len(wbs_elements), 4)
            self.assertIn('4380/A0/04/107', wbs_elements)
            self.assertIn('4380/A0/04/105', wbs_elements)
            self.assertIn('4380/A0/04/108', wbs_elements)
            self.assertIn('4380/A0/04/800', wbs_elements)

    def test_should_not_allow_unauthorised_user_to_import_sales(self):
        username = 'IP editor'
        password = 'password'
        create_user_with_group(username=username, password=password, email='ip_editor@mail.com',
                               group='Implementing Partner_editor')

        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.programme_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-'
                                        'programmes/', FILES)
            self.assertEqual(response.status_code, 403)

            self.assertEqual(Programme.objects.count(), 0)

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