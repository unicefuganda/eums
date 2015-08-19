from unittest import TestCase

from eums.models import Consignee


class ConsigneeTest(TestCase):

    def tearDown(self):
        Consignee.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        consignee = Consignee()
        fields_in_consignee = consignee._meta._name_map

        self.assertEqual(len(consignee._meta.fields), 8)
        for field in ['name', 'customer_id', 'id', 'type', 'location', 'imported_from_vision', 'remarks', 'created_by_user']:
            self.assertIn(field, fields_in_consignee)

    def test_string_representation_of_consignee_is_consignee_name(self):
        test_consignee = 'Test Consignee'
        consignee = Consignee(name=test_consignee)
        self.assertEqual(test_consignee, str(consignee))

    def test_return_true_when_remarks_is_the_only_change(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'name': 'Some Name', 'location': 'Some Location', 'remarks': 'another remark!'}
        self.assertTrue(consignee.has_only_dirty_remarks(received_consignee))

    def test_return_false_if_name_has_changed_along_with_remarks(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'name': 'Another Name', 'location': 'Some Location','remarks': 'another remark!'}
        self.assertFalse(consignee.has_only_dirty_remarks(received_consignee))

    def test_return_true_when_remarks_is_only_value_in_received_and_has_changed(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'remarks': 'another remark!'}
        self.assertTrue(consignee.has_only_dirty_remarks(received_consignee))

    def test_return_appropriately_when_non_core_fields_exist_in_recieve(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'remarks': 'another remark!', 'randome_value': 'Whoa!'}
        self.assertTrue(consignee.has_only_dirty_remarks(received_consignee))
