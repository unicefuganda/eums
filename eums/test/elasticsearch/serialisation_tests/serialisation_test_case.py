from django.test import TestCase
from eums.fixtures.flows import seed_flows
from eums.fixtures.ip_questions import seed_ip_questions


class SerialisationTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        seed_flows()
        seed_ip_questions()
