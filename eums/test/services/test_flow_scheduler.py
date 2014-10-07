from unittest import TestCase
import datetime

from mockito import mock, verify, when, any

from eums import celery
from eums.models import DistributionPlanNode, DistributionPlanLineItem, NodeLineItemRun
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
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
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)
        line_item_run = NodeLineItemRunFactory(node_line_item=line_item, status=NodeLineItemRun.STATUS.not_started)

        when(line_item).current_run().thenReturn(line_item_run)
        task_id = line_item_run.scheduled_message_task_id
        when(celery.app.control).revoke(task_id).thenReturn(None)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(DistributionPlanLineItem.objects).get(id=line_item.id).thenReturn(line_item)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(line_item)

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
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)
        line_item_run = NodeLineItemRunFactory(node_line_item=line_item, status=NodeLineItemRun.STATUS.not_started)

        when(line_item).current_run().thenReturn(line_item_run)
        task_id = line_item_run.scheduled_message_task_id
        when(celery.app.control).revoke(task_id).thenReturn(None)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(DistributionPlanLineItem.objects).get(id=line_item.id).thenReturn(line_item)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(line_item)

        verify(fake_facade).start_delivery_flow(
            sender=sender_org_name,
            consignee=self.contact,
            item_description=line_item.item.description
        )

    def test_should_save_a_node_line_item_run_with_task_id_after_and_phone_as_cache_scheduling_the_flow(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node,
                                                    planned_distribution_date=datetime.datetime.now())
        line_item_run = NodeLineItemRunFactory(node_line_item=line_item, status=NodeLineItemRun.STATUS.not_started)

        when(line_item).current_run().thenReturn(line_item_run)
        task_id = line_item_run.scheduled_message_task_id
        when(celery.app.control).revoke(task_id).thenReturn(None)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(DistributionPlanLineItem.objects).get(id=line_item.id).thenReturn(line_item)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(line_item)

        node_line_item_run_set = line_item.nodelineitemrun_set.all()

        #TODO remove the extra line item run to make this set have 1 item
        self.assertEqual(len(node_line_item_run_set), 2)
        self.assertEqual(node_line_item_run_set[0].phone, self.contact['phone'])
        self.assertEqual(node_line_item_run_set[0].scheduled_message_task_id, mock_celery.task_id)

    def test_should_schedule_flow_to_start_at_specific_time_after_expected_date_of_delivery(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node,
                                                    planned_distribution_date=datetime.datetime.now())
        line_item_run = NodeLineItemRunFactory(node_line_item=line_item, status=NodeLineItemRun.STATUS.not_started)

        when(line_item).current_run().thenReturn(line_item_run)
        task_id = line_item_run.scheduled_message_task_id
        when(celery.app.control).revoke(task_id).thenReturn(None)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(DistributionPlanLineItem.objects).get(id=line_item.id).thenReturn(line_item)
        when(node.consignee).build_contact().thenReturn(self.contact)

        schedule_run_for(line_item)

        self.assertEqual(mock_celery.invoked_after, 604800.0)

    def test_should_change_status_of_node_run_to_in_progress_when_scheduled_task_is_started(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node,
                                                    planned_distribution_date=datetime.datetime.now())
        line_item_run = NodeLineItemRunFactory(node_line_item=line_item, status=NodeLineItemRun.STATUS.not_started)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(DistributionPlanLineItem.objects).get(id=line_item.id).thenReturn(line_item)
        when(line_item).current_run().thenReturn(line_item_run)
        when(node.consignee).build_contact().thenReturn(self.contact)
        when(celery.app.control).revoke(line_item_run.scheduled_message_task_id).thenReturn(None)

        schedule_run_for(line_item)

        self.assertEqual(line_item_run.status, 'in_progress')

    def test_should_cancel_scheduled_flow_for_a_consignee_before_scheduling_another_one_for_that_node_line_item(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        line_item_one = DistributionPlanLineItemFactory(distribution_plan_node=node,
                                                        planned_distribution_date=datetime.datetime.now())
        DistributionPlanLineItemFactory(distribution_plan_node=node,
                                        planned_distribution_date=datetime.datetime.now())
        line_item_run = NodeLineItemRunFactory(node_line_item=line_item_one, status=NodeLineItemRun.STATUS.not_started)

        when(DistributionPlanNode.objects).get(id=node.id).thenReturn(node)
        when(DistributionPlanLineItem.objects).get(id=line_item_one.id).thenReturn(line_item_one)
        when(node.consignee).build_contact().thenReturn(self.contact)
        when(line_item_one).current_run().thenReturn(line_item_run)
        task_id = line_item_run.scheduled_message_task_id

        when(celery.app.control).revoke(task_id).thenReturn(None)

        schedule_run_for(line_item_one)

        schedule_run_for(line_item_one)

        #TODO Refactor to make it a single call
        verify(celery.app.control, times=2).revoke(task_id)
        verify(fake_facade, times=2).start_delivery_flow(sender=any(), consignee=any(), item_description=any())

    def tearDown(self):
        fake_facade.invocations = []

reload(rapid_pro_facade)