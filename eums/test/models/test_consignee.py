from unittest import TestCase

from mockito import when
import requests

from eums.models import Consignee
from eums.settings import CONTACTS_SERVICE_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.helpers.fake_response import FakeResponse


class ConsigneeTest(TestCase):
    def test_should_have_all_expected_fields(self):
        consignee = Consignee()
        fields = [str(field.attname) for field in consignee._meta.fields]

        for field in ['name', 'contact_person_id']:
            self.assertIn(field, fields)

    def test_should_build_contact_with_details_from_contacts_service(self):
        contact_id = '54335c56b3ae9d92f038abb0'
        fake_contact_json = {'firstName': "test", 'lastName': "user1", 'phone': "+256 782 443439", '_id': contact_id}
        fake_response = FakeResponse(fake_contact_json, 200)
        consignee = ConsigneeFactory(contact_person_id=contact_id)

        when(requests).get("%s%s/" % (CONTACTS_SERVICE_URL, contact_id)).thenReturn(fake_response)

        contact = consignee.build_contact()

        self.assertEqual(contact, fake_contact_json)

    def test_should_log_error_if_contact_error_is_encountered_when_fetching_contact_on_build_contact(self):
        pass

    def test_should_not_fetch_contact_from_contacts_service_if_contact_was_already_built(self):
        # TODO Check that it doesn't make an API call for an already built contact
        pass