from unittest import TestCase

from eums.models import Consignee


class ConsigneeTest(TestCase):
    def test_should_have_all_expected_fields(self):
        consignee = Consignee()
        fields_in_consignee = consignee._meta._name_map

        self.assertEqual(len(consignee._meta.fields), 4)
        for field in ['name', 'customer_id', 'id', 'type']:
            self.assertIn(field, fields_in_consignee)

    def test_string_representation_of_consignee_is_consignee_name(self):
        test_consignee = 'Test Consignee'
        consignee = Consignee(name=test_consignee)
        self.assertEqual(test_consignee, str(consignee))

    def tearDown(self):
        Consignee.objects.all().delete()
