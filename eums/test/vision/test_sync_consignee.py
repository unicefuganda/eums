from unittest import TestCase

from mock import MagicMock

from eums.models import Consignee
from eums.vision.consignee_synchronizer import ConsigneeSynchronizer


class TestSyncConsignee(TestCase):
    def setUp(self):
        self.downloaded_consignee = '[{"COUNTRY_CODE":"438",' \
                                    '"COUNTRY_NAME":"Uganda",' \
                                    '"CONSIGNEE_CODE":"L438001120",' \
                                    '"CONSIGNEE_NAME":"PATHFINDER INTERNATIONAL"},' \
                                    '{"COUNTRY_CODE":"438",' \
                                    '"COUNTRY_NAME":"Uganda",' \
                                    '"CONSIGNEE_CODE":"L438001121",' \
                                    '"CONSIGNEE_NAME":"JACOB LONY ALERO HC III"}]'

        self.expected_consignee_1 = Consignee(customer_id='L438001120',
                                              name='PATHFINDER INTERNATIONAL',
                                              imported_from_vision=True)
        self.expected_consignee_2 = Consignee(customer_id='L438001121',
                                              name='JACOB LONY ALERO HC III',
                                              imported_from_vision=True)

        self.synchronizer = ConsigneeSynchronizer()

    def tearDown(self):
        Consignee.objects.all().delete()

    def test_should_load_consignees(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_consignee)
        self.synchronizer._convert_records = MagicMock()
        self.synchronizer._save_records = MagicMock()
        self.synchronizer.sync()

        self.synchronizer._load_records.assert_called()
        self.synchronizer._convert_records.assert_called()
        self.synchronizer._save_records.assert_called()

    def test_should_save_consignee(self):
        self.synchronizer._load_records = MagicMock(return_value=self.downloaded_consignee)
        self.synchronizer.sync()

        all_consignees = Consignee.objects.all()
        actual_consignee_1 = all_consignees[0]
        actual_consignee_2 = all_consignees[1]

        self._assert_consignee_equal(actual_consignee_1, self.expected_consignee_1)
        self._assert_consignee_equal(actual_consignee_2, self.expected_consignee_2)

    def _assert_consignee_equal(self, actual_consignee, expected_consignee):
        self.assertEqual(actual_consignee.customer_id, expected_consignee.customer_id)
        self.assertEqual(actual_consignee.name, expected_consignee.name)
        self.assertEqual(actual_consignee.imported_from_vision, expected_consignee.imported_from_vision)
