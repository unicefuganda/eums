from unittest import TestCase

from mock import MagicMock

from eums.models import Consignee
from eums.test.vision.data.consignees import downloaded_consignee
from eums.vision.consignee_synchronizer import ConsigneeSynchronizer


class TestSyncConsignee(TestCase):
    def setUp(self):
        self.downloaded_consignee = downloaded_consignee
        self.expected_consignee = Consignee(customer_id='L438001120',
                                            name='PATHFINDER INTERNATIONAL',
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

        consignee = Consignee.objects.all().first()

        self._assert_consignee_equal(consignee, self.expected_consignee)

    def _assert_consignee_equal(self, actual_consignee, expected_consignee):
        self.assertEqual(actual_consignee.customer_id, expected_consignee.customer_id)
        self.assertEqual(actual_consignee.name, expected_consignee.name)
        self.assertEqual(actual_consignee.imported_from_vision, expected_consignee.imported_from_vision)
