from unittest import TestCase
from eums.utils import snakify


class TestUtils(TestCase):

    def test_snakify(self):
        text = "Chris George Kawa"
        self.assertEqual(snakify(text), "chris_george_kawa")