from unittest import TestCase

from eums import celery
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.services.mock_celery import mock_celery_task

celery.app.task = mock_celery_task

from eums.services.flow_scheduler import schedule_flows_for


class FlowSchedulerTest(TestCase):
    def setUp(self):
        pass

    def test_should_schedule_a_flow_for_a_consignee_from_a_plan_node_with_one_line_item(self):
        node = DistributionPlanNodeFactory.build()

        status = schedule_flows_for(node)
        self.assertEqual(status, "Delivery flow started")