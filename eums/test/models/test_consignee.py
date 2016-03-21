from unittest import TestCase

from eums.models import Consignee, DistributionPlan


class ConsigneeTest(TestCase):

    def tearDown(self):
        DistributionPlan.objects.all().delete()
        Consignee.objects.all().delete()

    def test_string_representation_of_consignee_is_consignee_name(self):
        test_consignee_name = 'Test Consignee'
        test_consignee_customer_id = 'U007'
        test_consignee = test_consignee_name + ' - ' + test_consignee_customer_id
        consignee = Consignee(name=test_consignee_name, customer_id=test_consignee_customer_id)
        self.assertEqual(test_consignee, str(consignee))

    def test_return_true_when_remarks_is_the_only_change(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'name': 'Some Name', 'location': 'Some Location', 'remarks': 'another remark!'}
        self.assertTrue(consignee.has_only_changed_editable_fields(received_consignee))

    def test_return_false_if_name_has_changed_along_with_remarks(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'name': 'Another Name', 'location': 'Some Location','remarks': 'another remark!'}
        self.assertFalse(consignee.has_only_changed_editable_fields(received_consignee))

    def test_return_true_when_remarks_is_only_value_in_received_and_has_changed(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'remarks': 'another remark!'}
        self.assertTrue(consignee.has_only_changed_editable_fields(received_consignee))

    def test_return_appropriately_when_non_core_fields_exist_in_recieve(self):
        consignee = Consignee(name='Some Name', location='Some Location', remarks='some remark!')
        received_consignee = {'remarks': 'another remark!', 'randome_value': 'Whoa!'}
        self.assertTrue(consignee.has_only_changed_editable_fields(received_consignee))
