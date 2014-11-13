from django.test import TestCase

from eums.templatetags.generic_tags import display_list, bootstrap_message, add_string


class GeneralTemplateTagTest(TestCase):
    def test_display_list_tag(self):
        sample_list = ['Global', 'Regional', 'Epi Manager']
        self.assertEqual(', '.join(sample_list), display_list(sample_list))

    def test_message(self):
        self.assertEqual('success', bootstrap_message('success'))
        self.assertEqual('danger', bootstrap_message('error'))
        self.assertEqual('warning', bootstrap_message('warning'))

    def test_should_return_concatenated_ints_in_a_single_string(self):
        self.assertEqual('1, 2', add_string(1, 2))
        self.assertEqual('1, 2', add_string('1', '2'))
