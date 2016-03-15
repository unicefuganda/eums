from unittest import TestCase

from mock import MagicMock

from eums.models import Programme
from eums.test.vision.data.programmes import downloaded_programme
from eums.vision.programme_synchronizer import ProgrammeSynchronizer


class TestSyncProgramme(TestCase):
    def setUp(self):
        self.downloaded_programme = downloaded_programme
        self.expected_programme = Programme(wbs_element_ex='4380/A0/04/105',
                                            name='YI105 - PCR 1 KEEP CHILDREN AND MOTHERS')

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

    def test_should_save_programmes(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_programme)
        self.synchronizer.sync()

        programme = Programme.objects.all().first()

        self._assert_programme_equal(programme, self.expected_programme)

    def _assert_programme_equal(self, actual_programme, expected_programme):
        self.assertEqual(actual_programme.name, expected_programme.name)
        self.assertEqual(actual_programme.wbs_element_ex, expected_programme.wbs_element_ex)
