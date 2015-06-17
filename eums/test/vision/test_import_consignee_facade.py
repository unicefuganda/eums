import os
from unittest import TestCase
from xlwt import Workbook
from eums.models import Consignee
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.vision.vision_facade import ConsigneeOrderFacade


class TestReleaseOrdersVisionFacade(TestCase):
    def setUp(self):
        self.consignee_file_location = 'consignees.xlsx'
        self.create_consignee_workbook()
        self.imported_consignee_data = [{'name': 'ADVOCATE COALITION FOR DE', 'customer_id': 'L438000582'},
                                        {'name': 'AGAGO DISTRICT PROBATION', 'customer_id': 'L438000025'},
                                        {'name': 'KALAS GIRLS PRIMARY SCHOO', 'customer_id': 'L438000532'}
                                        ]

        self.facade = ConsigneeOrderFacade(self.consignee_file_location)

    def tearDown(self):
        os.remove(self.consignee_file_location)
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

    def test_should_load_consignee_data(self):
        consignee_data = self.facade.load_records()

        self.assertEqual(consignee_data, self.imported_consignee_data)

    def test_should_save_consignee_data(self):
        self.assertEqual(Consignee.objects.count(), 0)
        self.facade.save_records(self.imported_consignee_data)

        self.assert_consignees_were_created()

    def assert_consignees_were_created(self):
        consignee_one = Consignee(name='ADVOCATE COALITION FOR DE', customer_id='L438000582',
                                  type=Consignee.TYPES.implementing_partner)
        consignee_two = Consignee(name='AGAGO DISTRICT PROBATION', customer_id='L438000025',
                                  type=Consignee.TYPES.implementing_partner)

        self.assert_consignees_are_equal(consignee_one, Consignee.objects.all()[0])
        self.assert_consignees_are_equal(consignee_two, Consignee.objects.all()[1])

    def assert_consignees_are_equal(self, consignee_one, consignee_two):
        self.assertEqual(consignee_one.name, consignee_two.name)
        self.assertEqual(consignee_one.customer_id, consignee_two.customer_id)
        self.assertEqual(consignee_one.type, consignee_two.type)