from unittest import TestCase
from django.db import IntegrityError

from eums.models import Programme


class ProgrammeTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = [field for field in Programme._meta._name_map]

        self.assertEquals(len(Programme._meta.fields), 3)

        for field in ['name', 'wbs_element_ex']:
            self.assertIn(field, fields_in_item)

    def test_no_two_programmes_should_have_the_same_wbs_element(self):
        create_programme = lambda: Programme(wbs_element_ex='4380/A0/04/105')
        create_programme()
        self.assertRaises(IntegrityError, create_programme)

    def test_should_know_the_string_representation_for_a_programme_returns_the_name(self):
        dummy_name = "Test Name"
        programme = Programme(name=dummy_name)
        self.assertEqual(dummy_name, str(programme))
