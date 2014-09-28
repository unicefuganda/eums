from unittest import TestCase

from eums.rapid_pro.fake_rapid_pro import runs


class FakeRapidProdRunsEndpointTest(TestCase):
    def setUp(self):
        self.phone = '+256 772 123456'

    def test_should_respond_with_run_list_on_post_to_runs(self):
        payload = {"phone": [self.phone]}
        response = runs.post(data=payload)
        self.assertEqual(response, [{"run": 1, "phone": [self.phone]}])

    def test_should_increment_run_ids_on_successive_post_to_runs(self):
        payload = {'phone': [self.phone]}

        response_one = runs.post(data=payload)
        response_two = runs.post(data=payload)

        self.assertEqual(response_one, [{"run": 1, "phone": [self.phone]}])
        self.assertEqual(response_two, [{"run": 2, "phone": [self.phone]}])

    def tearDown(self):
        runs.clear()