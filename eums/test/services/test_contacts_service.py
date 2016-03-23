from unittest import TestCase
from eums.services.contacts import Contacts


class ContactServiceTest(TestCase):
    def test_should_get_fullname(self):
        contact_data = {
            u'_id': 'contact_person_id',
            u'firstName': u'chris',
            u'lastName': u'george',
            u'phone': u'+256781111111'}

        contact = Contacts(**contact_data)

        self.assertEqual(contact.full_name(), "chris george")
