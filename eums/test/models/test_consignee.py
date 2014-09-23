from unittest import TestCase

from eums.models import Consignee


class ConsigneeTest(TestCase):

    def test_should_have_all_expected_fields(self):
        consignee = Consignee()
        fields = [str(field.attname) for field in consignee._meta.fields]

        for field in ['name', 'contact_person_id']:
            self.assertIn(field, fields)

    def test_should_build_contact_with_details_from_contacts_service(self):
        pass