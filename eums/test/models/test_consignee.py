from unittest import TestCase

from mockito import when, verify
import requests
from django.conf import settings

from eums.models import Consignee
from eums.test.factories.consignee_factory import ConsigneeFactory

from eums.rapid_pro.fake_response import FakeResponse
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory as LineItemFactory


class ConsigneeTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_consignee = Consignee()._meta._name_map

        for field in ['name', 'contact_person_id']:
            self.assertIn(field, fields_in_consignee)

    def test_string_representation_of_consignee_is_consignee_name(self):
        test_consignee = 'Test Consignee'
        consignee = Consignee(name=test_consignee)
        self.assertEqual(test_consignee, str(consignee))

    def test_should_build_contact_with_details_from_contacts_service(self):
        contact_id = '54335c56b3ae9d92f038abb0'
        fake_contact_json = {'firstName': "test", 'lastName': "user1", 'phone': "+256 782 443439",
                             '_id': contact_id}
        fake_response = FakeResponse(fake_contact_json, 200)
        consignee = ConsigneeFactory(contact_person_id=contact_id)
        when(requests).get("%s%s/" % (settings.CONTACTS_SERVICE_URL, contact_id)).thenReturn(fake_response)

        contact = consignee.build_contact()

        self.assertEqual(contact, fake_contact_json)
        self.assertEqual(consignee.contact, contact)

    def test_should_log_error_if_contact_error_is_encountered_when_fetching_contact_on_build_contact(self):
        pass

    def test_should_not_fetch_contact_from_contacts_service_if_contact_was_already_built(self):
        contact_id = '54335c56b3ae9d92f038abb1'
        fake_contact_json = {'firstName': "test", 'lastName': "user1", 'phone': "+256 782 443439",
                             '_id': contact_id}
        fake_response = FakeResponse(fake_contact_json, 200)
        consignee = ConsigneeFactory(contact_person_id=contact_id)
        when(requests).get("%s%s/" % (settings.CONTACTS_SERVICE_URL, contact_id)).thenReturn(fake_response)

        consignee.build_contact()
        consignee.build_contact()

        verify(requests, times=1).get("%s%s/" % (settings.CONTACTS_SERVICE_URL, contact_id))

    def test_should_get_consignees_that_have_contact_person_with_specified_phone_number(self):
        phone = "%2B256 782 443439"
        contact_1_id = '54335c56b3ae9d92f038abb2'
        contact_2_id = '54335c56b3ae9d92f038abb3'
        fake_contact_json = [
            {'firstName': "test", 'lastName': "user1", 'phone': phone, '_id': contact_1_id},
            {'firstName': "test", 'lastName': "user1", 'phone': phone, '_id': contact_2_id}]
        fake_response = FakeResponse(fake_contact_json, 200)
        consignee_1 = ConsigneeFactory(contact_person_id=contact_1_id)
        consignee_2 = ConsigneeFactory(contact_person_id=contact_2_id)

        when(requests).get("%s?searchfield=%s/" % (settings.CONTACTS_SERVICE_URL, phone)).thenReturn(fake_response)

        consignees = Consignee.get_consignees_with_phone(phone)

        verify(requests).get("%s?searchfield=%s/" % (settings.CONTACTS_SERVICE_URL, phone))

        self.assertIn(consignee_1, consignees)
        self.assertIn(consignee_2, consignees)

    def test_should_get_current_line_item_run(self):
        consignee = ConsigneeFactory()
        node = NodeFactory(consignee=consignee)
        line_item = LineItemFactory(distribution_plan_node=node)
        run = NodeLineItemRunFactory(node_line_item=line_item)
        when(line_item).current_node_line_item_run().thenReturn({})

        current_run = consignee.get_current_line_item_run()

        self.assertEqual(current_run, run)

    def test_should_get_current_run_from_the_first_node_with_a_line_item_that_has_an_active_run(self):
        pass

    def tearDown(self):
        Consignee.objects.all().delete()