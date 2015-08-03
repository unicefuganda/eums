from eums.test.api.authorization.permissions_test_case import PermissionsTestCase
import os
from eums.models import Consignee
from eums.test.api.api_test_helpers import create_user_with_group
from xlwt import Workbook
from eums.management.commands.setup_permissions import Command


class TestImportConsigneesEndpoint(PermissionsTestCase):
    def setUp(self):
        self.consignee_file_location = 'consignees.xlsx'
        self.create_consignee_workbook()
        Command().handle()

    def tearDown(self):
        os.remove(self.consignee_file_location)
        Consignee.objects.all().delete()

    def test_should_allow_authorised_user_to_import_consignees(self):
        username = 'unicef_admin1'
        password = 'password'

        create_user_with_group(username=username, password=password, email='admin@email.com', group='UNICEF_admin')

        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.consignee_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-consignees/', FILES)

            self.assertEqual(response.status_code, 200)
            consignee_names = [consignee.name for consignee in Consignee.objects.all()]
            self.assertEqual(len(consignee_names), 3)
            self.assertIn('ADVOCATE COALITION FOR DE', consignee_names)
            self.assertIn('AGAGO DISTRICT PROBATION', consignee_names)
            self.assertIn('KALAS GIRLS PRIMARY SCHOO', consignee_names)

    def test_should_not_allow_unauthorised_user_to_import_sales(self):
        username = 'IP editor'
        password = 'password'
        create_user_with_group(username=username, password=password, email='ip_editor@mail.com',
                               group='Implementing Partner_editor')

        self.client.login(username=username, password=password)

        FILES = {}
        with open(self.consignee_file_location) as file:
            FILES['file'] = file
            response = self.client.post('/api/import-consignees/', FILES)
            self.assertEqual(response.status_code, 403)

            self.assertEqual(Consignee.objects.count(), 0)


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