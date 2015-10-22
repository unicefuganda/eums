from django.test import TestCase
from eums.models import Flow


class SerialisationTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        from eums.fixtures.flows import seed_flows
        from eums.fixtures.ip_questions import seed_ip_questions
        seed_flows()
        seed_ip_questions()\


    @classmethod
    def tearDownClass(cls):
        Flow.objects.all().delete()
