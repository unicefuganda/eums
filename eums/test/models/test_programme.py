from unittest import TestCase

from eums.models import Programme


class ProgrammeTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_item = Programme()._meta._name_map

        for field in ['name', 'focal_person_id']:
            self.assertIn(field, fields_in_item)

    def test_should_know_the_string_representation_for_a_programme_returns_the_name(self):
        dummy_name = "Test Name"
        programme = Programme(name=dummy_name)
        self.assertEqual(dummy_name, str(programme))
