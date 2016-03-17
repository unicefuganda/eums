from unittest import TestCase

import datetime

from eums.utils import snakify, get_lists_intersection, filter_relevant_value, all_relevant_data_contained, \
    get_index_of_particular_element_in_complex_list, format_date


class TestUtils(TestCase):
    def test_snakify(self):
        text = "Chris George Kawa"
        self.assertEqual(snakify(text), "chris_george_kawa")

    def test_should_get_lists_intersection(self):
        source_list = [[1, 2, 3]]
        self.assertEqual(get_lists_intersection(source_list), [1, 2, 3])

        source_list.append([2, 3, 4])
        self.assertEqual(get_lists_intersection(source_list), [2, 3])

        source_list.append([3, 4, 5])
        self.assertEqual(get_lists_intersection(source_list), [3])

    def test_should_filter_relevant_value(self):
        mapping_template = {'SALES_ORDER_NO': 'order_number',
                            'MATERIAL_CODE': 'material_code',
                            'SO_ITEM_DESC': 'item_description'}

        original_date = {'SALES_ORDER_NO': 123456,
                         'key_to_be_filtered_1': 'value_to_be_filtered_1',
                         'MATERIAL_CODE': '2000',
                         'key_to_be_filtered_2': 'value_to_be_filtered_2',
                         'SO_ITEM_DESC': 'Laptop',
                         'key_to_be_filtered_3': 'value_to_be_filtered_3'}

        expected_date = {'order_number': 123456,
                         'material_code': '2000',
                         'item_description': 'Laptop'}

        self.assertEqual(filter_relevant_value(mapping_template, original_date), expected_date)

    def test_should_check_containing_all_relevant_data_or_not(self):
        checklist = ('order_number',
                     'material_code',
                     'item_description')

        date_1 = {'order_number': 123456,
                  'material_code': '2000',
                  'item_description': 'Laptop'}

        self.assertTrue(all_relevant_data_contained(date_1, checklist))

        date_2 = {'order_number': 123456,
                  'material_code': '2000'}

        self.assertFalse(all_relevant_data_contained(date_2, checklist))

    def test_should_get_index_of_particular_element(self):
        order_list = [{'order_number': 123456, 'material_code': '2000', 'item_description': 'Laptop'},
                      {'order_number': 654321, 'material_code': '2000', 'item_description': 'Laptop'},
                      {'order_number': 654321, 'material_code': '100', 'item_description': 'Laptop'}]

        filter_dict = {'order_number': 654321, 'material_code': '100'}

        self.assertEqual(get_index_of_particular_element_in_complex_list(order_list, filter_dict), 2)

    def test_should_get_formatted_date(self):
        date = datetime.date(2016, 3, 14)

        self.assertEqual(format_date(date), '14032016')
