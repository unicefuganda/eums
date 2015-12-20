from unittest import TestCase

from mock import MagicMock

from eums.models import Programme
from eums.vision.programme_synchronizer import ProgrammeSynchronizer


class TestSyncProgramme(TestCase):
    def setUp(self):
        self.downloaded_programme = {'GetProgrammeStructureList_JSONResult':
                                         '[{"BUSINESS_AREA_CODE":"4380",' \
                                         '"BUSINESS_AREA_NAME":"Uganda",' \
                                         '"COUNTRY_PROGRAMME_WBS":"4380/A0/04",' \
                                         '"COUNTRY_PROGRAMME_NAME":"UGANDA COUNTRY PROGRAM (2010 - 2015) EXT",' \
                                         '"CP_START_DATE":"\\/Date(1262322000000)\\/",' \
                                         '"CP_END_DATE":"\\/Date(1451538000000)\\/",' \
                                         '"OUTCOME_WBS":"4380/A0/04/105",' \
                                         '"OUTCOME_ID":105,' \
                                         '"OUTCOME_DESCRIPTION":"YI105 - PCR 1 KEEP CHILDREN AND MOTHERS",' \
                                         '"OUTPUT_WBS":"4380/A0/04/105/004",' \
                                         '"OUTPUT_ID":4,' \
                                         '"OUTPUT_DESCRIPTION":"IR 1.4 NUTRITION",' \
                                         '"ACTIVITY_WBS":"4380/A0/04/105/004/090",' \
                                         '"ACTIVITY_ID":90,' \
                                         '"ACTIVITY_DESCRIPTION":"1.4.90 STAFF, TRAVEL AND RELATED COSTS",' \
                                         '"SIC_CODE":"04-06-01",' \
                                         '"SIC_NAME":"Nutrition # General",' \
                                         '"GIC_CODE":"013",' \
                                         '"GIC_NAME":"Operating costs # staff",' \
                                         '"HUMANITARIAN_TAG":"No",' \
                                         '"ACTIVITY_FOCUS_CODE":"6",' \
                                         '"ACTIVITY_FOCUS_NAME":"6 Management/Operations"},' \
                                         '' \
                                         '{"BUSINESS_AREA_CODE":"4380",' \
                                         '"BUSINESS_AREA_NAME":"Uganda",' \
                                         '"COUNTRY_PROGRAMME_WBS":"4380/A0/05",' \
                                         '"COUNTRY_PROGRAMME_NAME":"UGANDA CONTRY PROGRAMME (2016 - 2020)",' \
                                         '"CP_START_DATE":"\\/Date(1451624400000)\\/",' \
                                         '"CP_END_DATE":"\\/Date(1609390800000)\\/",' \
                                         '"OUTCOME_WBS":"4380/A0/05/113",' \
                                         '"OUTCOME_ID":113,' \
                                         '"OUTCOME_DESCRIPTION":"3: CHILD PROTECTION",' \
                                         '"OUTPUT_WBS":"4380/A0/05/113/003",' \
                                         '"OUTPUT_ID":3,' \
                                         '"OUTPUT_DESCRIPTION":"OUTPUT 3.3 BIRTH REGISTRATION",' \
                                         '"ACTIVITY_WBS":"4380/A0/05/113/003/001",' \
                                         '"ACTIVITY_ID":1,' \
                                         '"ACTIVITY_DESCRIPTION":"3.3.90 STAFF COSTS",' \
                                         '"SIC_CODE":"06-05-01",' \
                                         '"SIC_NAME":"Birth and civil registration",' \
                                         '"GIC_CODE":"013",' \
                                         '"GIC_NAME":"Operating costs # staff",' \
                                         '"HUMANITARIAN_TAG":"No",' \
                                         '"ACTIVITY_FOCUS_CODE":"6",' \
                                         '"ACTIVITY_FOCUS_NAME":"6 Management/Operations"}]'}

        self.converted_programme = [{'wbs_element_ex': '4380/A0/04/105',
                                     'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'},
                                    {'wbs_element_ex': '4380/A0/05/113',
                                     'name': '3: CHILD PROTECTION'}]
        self.expected_programme_1 = Programme(wbs_element_ex='4380/A0/04/105',
                                              name='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS')
        self.expected_programme_2 = Programme(wbs_element_ex='4380/A0/05/113',
                                              name='3: CHILD PROTECTION')

        self.synchronizer = ProgrammeSynchronizer()

    def tearDown(self):
        Programme.objects.all().delete()

    def test_should_load_programmes(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_programme)
        self.synchronizer._convert_records = MagicMock()
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._convert_records.assert_called()
        self.synchronizer._save_records.assert_called()

    def test_should_convert_programmes(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_programme)
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._save_records.assert_called_with(self.converted_programme)

    def test_should_save_programmes(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_programme)
        self.synchronizer.sync()

        all_programmes = Programme.objects.all()
        actual_programme_1 = all_programmes[0]
        actual_programme_2 = all_programmes[1]

        self._assert_programme_equal(actual_programme_1, self.expected_programme_1)
        self._assert_programme_equal(actual_programme_2, self.expected_programme_2)

    def _assert_programme_equal(self, actual_programme, expected_programme):
        self.assertEqual(actual_programme.name, expected_programme.name)
        self.assertEqual(actual_programme.wbs_element_ex, expected_programme.wbs_element_ex)
