from unittest import TestCase
import datetime

from mockito import mock, verify, when, never, any

from eums import celery
from eums.models import DistributionPlanNode
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.helpers.fake_datetime import FakeDatetime
from eums.test.services.mock_celery import MockCelery


datetime.datetime = FakeDatetime
mock_celery = MockCelery()
celery.app.task = mock_celery.task

from eums.rapid_pro import rapid_pro_facade

fake_facade = mock()
rapid_pro_facade.start_delivery_run = fake_facade.start_delivery_flow

from eums.services.flow_scheduler import schedule_run_for


class FlowSchedulerTest(TestCase):
    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}

    def test_should_schedule_a_flow_with_sender_as_unicef_if_node_has_no_parent(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        DistributionPlanLineItemFactory(distribution_plan_node=node)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(node)

        line_item = node.distributionplanlineitem_set.all()[0]

        verify(fake_facade).start_delivery_flow(
            sender='UNICEF',
            consignee=self.contact,
            item_description=line_item.item.description,
        )

    def test_should_schedule_flow_with_sender_as_parent_node_consignee_name_if_node_has_parent(self):
        sender_org_name = "Dwelling Places"
        sender_org = ConsigneeFactory(name=sender_org_name)
        parent_node = DistributionPlanNodeFactory(consignee=sender_org)
        node = DistributionPlanNodeFactory(consignee=self.consignee, parent=parent_node)
        DistributionPlanLineItemFactory(distribution_plan_node=node)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(node)

        line_item = node.distributionplanlineitem_set.all()[0]

        verify(fake_facade).start_delivery_flow(
            sender=sender_org_name,
            consignee=self.contact,
            item_description=line_item.item.description
        )

    def test_should_save_a_node_run_with_task_id_after_scheduling_the_flow(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        DistributionPlanLineItemFactory(distribution_plan_node=node, planned_distribution_date=datetime.datetime.now())

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(node)

        node_run_set = node.noderun_set.all()
        self.assertEqual(len(node_run_set), 1)
        self.assertEqual(node_run_set[0].scheduled_message_task_id, mock_celery.task_id)

    def test_should_schedule_flow_to_start_at_specific_time_after_expected_date_of_delivery(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        DistributionPlanLineItemFactory(distribution_plan_node=node, planned_distribution_date=datetime.datetime.now())

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(node)

        self.assertEqual(mock_celery.invoked_after, 604800.0)

    def test_should_cancel_scheduled_flow_for_a_consignee_before_scheduling_another_one_for_the_same_node(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        DistributionPlanLineItemFactory(distribution_plan_node=node, planned_distribution_date=datetime.datetime.now())

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(node)

        task_id = node.current_node_run().scheduled_message_task_id
        when(celery.app.control).revoke(task_id).thenReturn(None)

        schedule_run_for(node)

        verify(celery.app.control).revoke(task_id)
        verify(fake_facade, times=2).start_delivery_flow(sender=any(), consignee=any(), item_description=any())

    # TODO Remove this when the line item is moved to the distribution plan
    def test_should_not_schedule_flow_if_node_has_no_line_items(self):
        node = DistributionPlanNodeFactory()
        schedule_run_for(node)

        verify(fake_facade, never).start_delivery_flow()

    def tearDown(self):
        fake_facade.invocations = []

reload(rapid_pro_facade)