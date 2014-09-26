# smoke tests for contacts service and rapid pro APIs


# Test that api endpoints as described in settings are up (e.g. test that flow exists on rapid pro)
# Test that flow takes the parameters we provide
from unittest import TestCase


class RapidProSmoke(TestCase):
    def test_fail(self):
        self.assertEqual(1, 1)