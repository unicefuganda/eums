from unittest import TestCase
import datetime

from django.conf import settings
from mock import MagicMock, ANY, patch

from eums import celery
from eums.models import NodeLineItemRun, DistributionPlanNode, DistributionPlanLineItem
from eums.rapid_pro import rapid_pro_facade
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
from eums.test.helpers.fake_datetime import FakeDatetime
from eums.test.services.mock_celery import MockCelery


datetime.datetime = FakeDatetime
mock_celery = MockCelery()
celery.app.task = mock_celery.task

mock_start_delivery_run = MagicMock()
rapid_pro_facade.start_delivery_run = mock_start_delivery_run

from eums.services.flow_scheduler import schedule_run_for


class FlowSchedulerTest(TestCase):
    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}

        self.node = DistributionPlanNodeFactory(consignee=self.consignee)
        self.line_item = DistributionPlanLineItemFactory(distribution_plan_node=self.node)

        celery.app.control.revoke = MagicMock(return_value=None)
        self.node.consignee.build_contact = MagicMock(return_value=self.contact)
        DistributionPlanNode.objects.get = MagicMock(return_value=self.node)
        DistributionPlanLineItem.objects.get = MagicMock(return_value=self.line_item)

        self.END_USER_FLOW_ID = settings.RAPIDPRO_FLOWS['END_USER']
        self.MIDDLEMAN_FLOW_ID = settings.RAPIDPRO_FLOWS['MIDDLE_MAN']

    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_schedule_middleman_flow_if_node_tree_position_is_middleman(self, mock_current_run_for_consignee):
        node = DistributionPlanNodeFactory(consignee=self.consignee, tree_position=DistributionPlanNode.MIDDLE_MAN)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

        mock_current_run_for_consignee.return_value = None
        DistributionPlanLineItem.objects.get = MagicMock(return_value=line_item)
        DistributionPlanNode.objects.get = MagicMock(return_value=node)

        schedule_run_for(line_item)

        mock_start_delivery_run.assert_called_with(consignee=self.contact, flow=self.MIDDLEMAN_FLOW_ID,
                                                   item_description=ANY, sender=ANY)

    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_schedule_end_user_flow_if_node_tree_position_is_end_user(self, mock_current_run_for_consignee):
        node = DistributionPlanNodeFactory(consignee=self.consignee, tree_position=DistributionPlanNode.END_USER)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

        mock_current_run_for_consignee.return_value = None
        DistributionPlanNode.objects.get = MagicMock(return_value=node)
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
        parent_node = DistributionPlanNodeFactory(consignee=sender_org)
        node = DistributionPlanNodeFactory(consignee=sender_org, parent=parent_node)
        line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

        DistributionPlanNode.objects.get = MagicMock(return_value=node)
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

        self.assertEqual(mock_celery.invoked_after, 1814400.0)

    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_cancel_scheduled_run_for_consignee_before_scheduling_another_one_for_the_same_node_line_item(self,
                                                                                                                 mock_current_run_for_consignee):
        line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item)

        self.line_item.current_run = MagicMock(return_value=line_item_run)
        mock_current_run_for_consignee.return_value = None

        schedule_run_for(self.line_item)

        self.assertEqual(line_item_run.status, NodeLineItemRun.STATUS.cancelled)
        celery.app.control.revoke.assert_called()
        mock_start_delivery_run.assert_called()

    @patch('eums.models.RunQueue.enqueue')
    @patch('eums.models.NodeLineItemRun.current_run_for_consignee')
    def test_should_queue_run_for_a_consignee_if_consignee_has_current_run_for_a_different_node_line_item(self,
                                                                                                          mock_current_run_for_consignee,
                                                                                                          mock_run_queue_enqueue):
        line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item)
        node_two = DistributionPlanNodeFactory(consignee=self.consignee)
        line_item_two = DistributionPlanLineItemFactory(distribution_plan_node=node_two)

        self.line_item.current_run = MagicMock(return_value=None)
        mock_current_run_for_consignee.return_value = line_item_run
        mock_run_queue_enqueue.return_value = None

        schedule_run_for(line_item_two)
        mock_run_queue_enqueue.assert_called_with(line_item_two, ANY)

reload(rapid_pro_facade)