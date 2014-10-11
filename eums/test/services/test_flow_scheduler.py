from unittest import TestCase
import datetime

import celery
from celery.schedules import crontab
from mock import MagicMock, ANY, patch

from eums.test.services.mock_celery import MockCelery, MockPeriodicTask
from eums import local_celery
from eums.models import DistributionPlanNode as Node, Flow
from eums.models import NodeLineItemRun, DistributionPlanLineItem, RunQueue
from eums.rapid_pro import rapid_pro_facade
from eums.test.factories.RunQueueFactory import RunQueueFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
from eums.test.helpers.fake_datetime import FakeDatetime


datetime.datetime = FakeDatetime
mock_celery = MockCelery()
local_celery.app.task = mock_celery.task
celery.task.periodic_task = MockPeriodicTask

mock_start_delivery_run = MagicMock()
rapid_pro_facade.start_delivery_run = mock_start_delivery_run

from eums.services.flow_scheduler import schedule_run_for, expire_overdue_runs


class FlowSchedulerTest(TestCase):
    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}

        self.node = NodeFactory(consignee=self.consignee)
        self.line_item = DistributionPlanLineItemFactory(distribution_plan_node=self.node, consignee=self.consignee)
        local_celery.app.control.revoke = MagicMock(return_value=None)
        self.node.consignee.build_contact = MagicMock(return_value=self.contact)
        Node.objects.get = MagicMock(return_value=self.node)
        DistributionPlanLineItem.objects.get = MagicMock(return_value=self.line_item)

        self.MIDDLEMAN_FLOW_ID = FlowFactory(for_node_type=Node.MIDDLE_MAN).rapid_pro_id
        self.END_USER_FLOW_ID = FlowFactory(for_node_type=Node.END_USER).rapid_pro_id

    def tearDown(self):
        Flow.objects.all().delete()

    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_schedule_middleman_flow_if_node_tree_position_is_middleman(self, mock_current_run_for_consignee):
        node = NodeFactory(consignee=self.consignee, tree_position=Node.MIDDLE_MAN)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

        mock_current_run_for_consignee.return_value = None
        DistributionPlanLineItem.objects.get = MagicMock(return_value=line_item)
        Node.objects.get = MagicMock(return_value=node)

        schedule_run_for(line_item)

        mock_start_delivery_run.assert_called_with(consignee=self.contact, flow=self.MIDDLEMAN_FLOW_ID,
                                                   item_description=ANY, sender=ANY)

    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_schedule_end_user_flow_if_node_tree_position_is_end_user(self, mock_current_run_for_consignee):
        node = NodeFactory(consignee=self.consignee, tree_position=Node.END_USER)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

        mock_current_run_for_consignee.return_value = None
        Node.objects.get = MagicMock(return_value=node)
        DistributionPlanLineItem.objects.get = MagicMock(return_value=line_item)

        schedule_run_for(line_item)

        mock_start_delivery_run.assert_called_with(consignee=self.contact, flow=self.END_USER_FLOW_ID,
                                                   item_description=ANY, sender=ANY)

    def test_should_schedule_a_flow_with_sender_as_unicef_if_node_has_no_parent(self):
        schedule_run_for(self.line_item)

        mock_start_delivery_run.assert_called_with(sender='UNICEF', consignee=self.contact, flow=ANY,
                                                   item_description=self.line_item.item.description)

    def test_should_schedule_flow_with_sender_as_parent_node_consignee_name_if_node_has_parent(self):
        sender_org_name = "Dwelling Places"
        sender_org = ConsigneeFactory(name=sender_org_name)
        parent_node = NodeFactory(consignee=sender_org)
        node = NodeFactory(consignee=sender_org, parent=parent_node)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

        Node.objects.get = MagicMock(return_value=node)
        DistributionPlanLineItem.objects.get = MagicMock(return_value=line_item)
        node.consignee.build_contact = MagicMock(return_value=self.contact)

        schedule_run_for(line_item)

        mock_start_delivery_run.assert_called_with(consignee=self.contact, flow=ANY, sender=sender_org_name,
                                                   item_description=line_item.item.description)

    def test_should_save_a_node_line_item_run_with_task_id_and_phone_as_cache_after_scheduling_the_flow(self):
        schedule_run_for(self.line_item)

        node_line_item_run_set = self.line_item.nodelineitemrun_set.all()

        self.assertEqual(len(node_line_item_run_set), 1)
        self.assertEqual(node_line_item_run_set[0].phone, self.contact['phone'])
        self.assertEqual(node_line_item_run_set[0].scheduled_message_task_id, mock_celery.task_id)

    def test_should_schedule_flow_to_start_at_specific_time_after_expected_date_of_delivery(self):
        schedule_run_for(self.line_item)

        self.assertEqual(mock_celery.invoked_after, 604800.0)

    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_cancel_scheduled_run_for_consignee_before_scheduling_another_one_for_the_same_node_line_item(self,
                                                                                                                 mock_current_run_for_consignee):
        line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item)

        self.line_item.current_run = MagicMock(return_value=line_item_run)
        mock_current_run_for_consignee.return_value = None

        schedule_run_for(self.line_item)

        self.assertEqual(line_item_run.status, NodeLineItemRun.STATUS.cancelled)
        local_celery.app.control.revoke.assert_called()
        mock_start_delivery_run.assert_called()

    @patch('eums.models.RunQueue.enqueue')
    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_queue_run_for_a_consignee_if_consignee_has_current_run_for_a_different_node_line_item(self,
                                                                                                          mock_current_run_for_consignee,
                                                                                                          mock_run_queue_enqueue):
        line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item)
        node_two = NodeFactory(consignee=self.consignee)
        line_item_two = DistributionPlanLineItemFactory(distribution_plan_node=node_two)

        self.line_item.current_run = MagicMock(return_value=None)
        mock_current_run_for_consignee.return_value = line_item_run
        mock_run_queue_enqueue.return_value = None

        schedule_run_for(line_item_two)

        mock_run_queue_enqueue.assert_called_with(line_item_two, ANY)


    @patch('eums.models.NodeLineItemRun.overdue_runs')
    def test_should_expire_overdue_runs(self, mock_get_overdue_runs):
        node_line_item_run = NodeLineItemRunFactory()
        mock_get_overdue_runs.return_value = [node_line_item_run]

        expire_overdue_runs()

        mock_get_overdue_runs.assert_called()
        self.assertEqual(node_line_item_run.status, NodeLineItemRun.STATUS.expired)


    @patch('eums.models.RunQueue.dequeue')
    @patch('eums.services.flow_scheduler.schedule_run_for')
    @patch('eums.models.NodeLineItemRun.overdue_runs')
    def test_should_schedule_queued_runs_for_a_consignee_after_expiring_over_due_runs(self, mock_get_overdue_runs,
                                                                                      mock_schedule_run_for,
                                                                                      mock_deque):
        overdue_line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item, consignee=self.consignee)
        node_line_item = DistributionPlanLineItemFactory(consignee=self.consignee)
        run_queue_item = RunQueueFactory(node_line_item=node_line_item,
                                         contact_person_id=self.consignee.contact_person_id)

        mock_get_overdue_runs.return_value = [overdue_line_item_run]
        mock_schedule_run_for.return_value = None
        mock_deque.return_value = run_queue_item

        expire_overdue_runs()

        mock_deque.assert_called_with(self.consignee.contact_person_id)
        mock_schedule_run_for.assert_called_with(run_queue_item.node_line_item)
        self.assertEqual(run_queue_item.status, RunQueue.STATUS.started)

    @patch('eums.services.flow_scheduler.expire_overdue_runs')
    def test_should_schedule_expire_runs_to_execute_at_midnight_every_day(self, mock_expire_overdue_runs):
        mock_expire_overdue_runs.return_value = None

        mock_expire_overdue_runs()

        MockPeriodicTask.assert_called_with(crontab(minute=0, hour=0))


reload(rapid_pro_facade)