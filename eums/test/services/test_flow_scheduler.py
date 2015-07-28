from unittest import TestCase
import datetime

import celery
from celery.schedules import crontab

from mock import MagicMock, ANY, patch

from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.services.mock_celery import MockCelery, MockPeriodicTask
from eums import celery as local_celery
from eums.models import DistributionPlanNode as Node, Flow, Runnable
from eums.models import Run, RunQueue
from eums.rapid_pro import rapid_pro_facade
from eums.test.factories.RunQueueFactory import RunQueueFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory as NodeFactory, \
    DistributionPlanNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.run_factory import RunFactory
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
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}

        self.node = NodeFactory()
        local_celery.app.control.revoke = MagicMock(return_value=None)
        self.node.build_contact = MagicMock(return_value=self.contact)
        Node.objects.get = MagicMock(return_value=self.node)
        Runnable.objects.get = MagicMock(return_value=self.node)

        self.MIDDLEMAN_FLOW_ID = FlowFactory(for_runnable_type=Runnable.MIDDLE_MAN).rapid_pro_id
        self.END_USER_FLOW_ID = FlowFactory(for_runnable_type=Runnable.END_USER).rapid_pro_id
        self.IMPLEMENTING_PARTNER_FLOW_ID = FlowFactory(for_runnable_type=Runnable.IMPLEMENTING_PARTNER).rapid_pro_id

    def tearDown(self):
        Run.objects.all().delete()
        RunQueue.objects.all().delete()
        Flow.objects.all().delete()
        Node.objects.all().delete()

    def test_should_schedule_middleman_flow_if_node_tree_position_is_middleman(self):
        node = NodeFactory(tree_position=Node.MIDDLE_MAN)
        node.build_contact = MagicMock(return_value=self.contact)

        Node.objects.get = MagicMock(return_value=node)

        schedule_run_for(node)

        mock_start_delivery_run.assert_called_with(contact_person=self.contact, flow=self.MIDDLEMAN_FLOW_ID,
                                                   item_description=ANY, sender=ANY)

    def test_should_schedule_end_user_flow_if_node_tree_position_is_end_user(self):
        node = NodeFactory(tree_position=Node.END_USER)
        node.build_contact = MagicMock(return_value=self.contact)

        Node.objects.get = MagicMock(return_value=node)

        schedule_run_for(node)

        mock_start_delivery_run.assert_called_with(contact_person=self.contact, flow=self.END_USER_FLOW_ID,
                                                   item_description=ANY, sender=ANY)

    def test_should_schedule_implementing_partner_flow_if_runnable_is_delivery(self):
        delivery = DistributionPlanFactory()
        delivery.build_contact = MagicMock(return_value=self.contact)

        Runnable.objects.get = MagicMock(return_value=delivery)

        schedule_run_for(delivery)

        mock_start_delivery_run.assert_called_with(contact_person=self.contact, flow=self.IMPLEMENTING_PARTNER_FLOW_ID,
                                                   item_description=ANY, sender=ANY)

    def test_should_schedule_a_flow_with_sender_as_unicef_if_node_has_no_parent(self):
        self.node.build_contact = MagicMock(return_value=self.contact)
        schedule_run_for(self.node)

        mock_start_delivery_run.assert_called_with(sender='UNICEF', contact_person=self.contact, flow=ANY,
                                                   item_description=self.node.item.item.description)

    def test_should_schedule_flow_with_sender_as_parent_node_consignee_name_if_node_has_parent(self):
        sender_org_name = "Dwelling Places"
        sender_org = ConsigneeFactory(name=sender_org_name)
        parent_node = NodeFactory(consignee=sender_org)
        node = NodeFactory(consignee=sender_org, parent=parent_node)
        node.build_contact = MagicMock(return_value=self.contact)

        Runnable.objects.get = MagicMock(return_value=node)
        node.consignee.build_contact = MagicMock(return_value=self.contact)

        schedule_run_for(node)

        mock_start_delivery_run.assert_called_with(contact_person=self.contact, flow=ANY, sender=sender_org_name,
                                                   item_description=node.item.item.description)

    def test_should_save_a_run_with_task_id_and_phone_as_cache_after_scheduling_the_flow(self):
        schedule_run_for(self.node)

        run_set = self.node.run_set.all()

        self.assertEqual(len(run_set), 1)
        self.assertEqual(run_set[0].phone, self.contact['phone'])
        self.assertEqual(run_set[0].scheduled_message_task_id, mock_celery.task_id)

    def test_should_schedule_flow_to_start_at_specific_time_after_expected_date_of_delivery(self):
        schedule_run_for(self.node)

        self.assertEqual(mock_celery.invoked_after, 604800.0)

    def test_should_cancel_scheduled_run_for_consignee_before_scheduling_another_one_for_the_same_node(self):
        run = RunFactory(runnable=self.node)

        self.node.current_run = MagicMock(return_value=run)

        schedule_run_for(self.node)

        self.assertEqual(run.status, Run.STATUS.cancelled)

        local_celery.app.control.revoke.assert_called()
        mock_start_delivery_run.assert_called()

    @patch('eums.models.RunQueue.enqueue')
    def test_should_queue_run_for_a_contact_if_contact_has_current_run_for_a_different_runnable(self,
                                                                                                     mock_run_queue_enqueue):
        RunFactory(runnable=self.node)
        node_two = NodeFactory(contact_person_id=self.node.contact_person_id)
        node_two.build_contact = MagicMock(return_value=self.contact)
        mock_run_queue_enqueue.return_value = None
        schedule_run_for(node_two)

        mock_run_queue_enqueue.assert_called_with(node_two, ANY)

    @patch('eums.models.Run.overdue_runs')
    def test_should_expire_overdue_runs(self, mock_get_overdue_runs):
        run = RunFactory()
        mock_get_overdue_runs.return_value = [run]

        expire_overdue_runs()

        mock_get_overdue_runs.assert_called()
        self.assertEqual(run.status, Run.STATUS.expired)

    @patch('eums.models.RunQueue.dequeue')
    @patch('eums.services.flow_scheduler.schedule_run_for')
    @patch('eums.models.Run.overdue_runs')
    def test_should_schedule_queued_runs_for_a_consignee_after_expiring_over_due_runs(self, mock_get_overdue_runs,
                                                                                      mock_schedule_run_for,
                                                                                      mock_deque):
        overdue_run = RunFactory(runnable=self.node)
        node = DistributionPlanNodeFactory()
        run_queue_item = RunQueueFactory(runnable=node,
                                         contact_person_id=self.node.contact_person_id)

        mock_get_overdue_runs.return_value = [overdue_run]
        mock_schedule_run_for.return_value = None
        mock_deque.return_value = run_queue_item

        expire_overdue_runs()

        mock_deque.assert_called_with(self.node.contact_person_id)
        mock_schedule_run_for.assert_called_with(run_queue_item.runnable)
        self.assertEqual(run_queue_item.status, RunQueue.STATUS.started)

    @patch('eums.services.flow_scheduler.expire_overdue_runs')
    def test_should_schedule_expire_runs_to_execute_at_midnight_every_day(self, mock_expire_overdue_runs):
        mock_expire_overdue_runs.return_value = None

        mock_expire_overdue_runs()

        MockPeriodicTask.assert_called_with(crontab(minute=0, hour=0))


reload(rapid_pro_facade)
