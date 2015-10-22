from unittest import TestCase
from django.db import IntegrityError

from eums.models import SalesOrder, DistributionPlan, Arc
from eums.test.factories.arc_factory import ArcFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


class ArcTest(TestCase):
    def tearDown(self):
        self.clean_up()

    def test_should_not_create_arc_with_source_and_destination_as_the_same_node(self):
        node = DeliveryNodeFactory()
        create_arc = lambda: ArcFactory(source=node, target=node)
        self.assertRaises(IntegrityError, create_arc)

    def test_should_not_create_arc_without_target_node(self):
        create_arc = lambda: Arc(quantity=10).save()
        self.assertRaises(IntegrityError, create_arc)

    def test_should_not_create_arc_if_quantity_on_arc_is_greater_than_source_node_balance(self):
        node = DeliveryNodeFactory(quantity=10)
        create_bad_arc = lambda: ArcFactory(source=node, quantity=20)
        self.assertRaises(IntegrityError, create_bad_arc)

    def clean_up(self):
        DistributionPlan.objects.all().delete()
        SalesOrder.objects.all().delete()
