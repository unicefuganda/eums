from unittest import TestCase
from eums.rapid_pro.fake_response import FakeResponse


class FakeResponseTest(TestCase):
    def test_should_respond_with_json_data_and_status_code_passed(self):
        expected_json = {"key": "value"}
        expected_status_code = 1

        fake_response = FakeResponse(expected_json, expected_status_code)
        
        self.assertEqual(fake_response.json(), expected_json)
        self.assertEqual(fake_response.status_code, expected_status_code)
