from unittest import TestCase
from django.db import IntegrityError

from eums.models import SalesOrder, DistributionPlan, Arc
from eums.test.factories.arc_factory import ArcFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory


class ArcTest(TestCase):
    def tearDown(self):
        self.clean_up()

    def test_should_have_all_expected_fields(self):
        arc = ArcFactory()
        fields = arc._meta._name_map

        self.assertEqual(len(arc._meta.fields), 4)
        for field in ['source', 'target', 'quantity']:
            self.assertIn(field, fields)

    def test_should_not_create_arc_with_source_and_destination_as_the_same_node(self):
        node = DistributionPlanNodeFactory()
        create_arc = lambda: ArcFactory(source=node, target=node)
        self.assertRaises(IntegrityError, create_arc)

    def test_should_not_create_arc_without_target_node(self):
        create_arc = lambda: Arc(quantity=10).save()
        self.assertRaises(IntegrityError, create_arc)

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        SalesOrder.objects.all().delete()
