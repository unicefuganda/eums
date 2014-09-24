from unittest import TestCase

from mockito import when, verify
import requests

from eums.models import Consignee
from eums.settings import CONTACTS_SERVICE_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.helpers.fake_response import FakeResponse


class ConsigneeTest(TestCase):
    def setUp(self):
        self.contact_id = '54335c56b3ae9d92f038abb0'
        self.fake_contact_json = {'firstName': "test", 'lastName': "user1", 'phone': "+256 782 443439",
                                  '_id': self.contact_id}
        self.fake_response = FakeResponse(self.fake_contact_json, 200)
        self.consignee = ConsigneeFactory(contact_person_id=self.contact_id)

        when(requests).get("%s%s/" % (CONTACTS_SERVICE_URL, self.contact_id)).thenReturn(self.fake_response)

    def test_should_have_all_expected_fields(self):
        consignee = Consignee()
        fields = [str(field.attname) for field in consignee._meta.fields]

        for field in ['name', 'contact_person_id']:
            self.assertIn(field, fields)

    def test_should_build_contact_with_details_from_contacts_service(self):
        contact = self.consignee.build_contact()

        self.assertEqual(contact, self.fake_contact_json)
        self.assertEqual(self.consignee.contact, contact)

    def test_should_log_error_if_contact_error_is_encountered_when_fetching_contact_on_build_contact(self):
        pass

    # TODO un-x this. 
    def xtest_should_not_fetch_contact_from_contacts_service_if_contact_was_already_built(self):
        stub = when(requests).get("%s%s/" % (CONTACTS_SERVICE_URL, self.contact_id)).thenReturn(self.fake_response)
        print "*" * 20, stub.__dict__, "*" * 20

        self.consignee.build_contact()
        self.consignee.build_contact()

        # TODO Fix this. Shouldn't remember calls from past tests
        verify(requests, times=1).get("%s%s/" % (CONTACTS_SERVICE_URL, self.contact_id))