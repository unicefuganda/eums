from unittest import TestCase

from eums.rapid_pro.fake_rapid_pro import runs


class FakeRapidProdRunsEndpointTest(TestCase):
    def test_should_respond_with_run_list_on_post_to_runs(self):
        phone = '+256 772 123456'
        payload = {"phone": [phone]}

        response = runs.post(data=payload)

        self.assertEqual(response, [{"run": 1, "phone": [phone]}])
