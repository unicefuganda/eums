from unittest import TestCase
from eums.utils import snakify, get_lists_intersection


class TestUtils(TestCase):

    def test_snakify(self):
        text = "Chris George Kawa"
        self.assertEqual(snakify(text), "chris_george_kawa")

    def test_get_list_intersection(self):
        source_list = [[1, 2, 3]]
        self.assertEqual(get_lists_intersection(source_list), [1, 2, 3])

        source_list.append([2, 3, 4])
        self.assertEqual(get_lists_intersection(source_list), [2, 3])

        source_list.append([3, 4, 5])
        self.assertEqual(get_lists_intersection(source_list), [3])
