from unittest import TestCase
import celery
import datetime
from celery.schedules import crontab
from mock import MagicMock, ANY, patch
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, TextAnswerFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory
from eums.test.services.mock_celery import MockCelery, MockPeriodicTask
from eums import celery as local_celery
from eums.models import DistributionPlanNode as Node, Question, Runnable, Flow, Run, RunQueue, Alert
from eums.rapid_pro.rapid_pro_service import rapid_pro_service
from eums.test.factories.RunQueueFactory import RunQueueFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory as NodeFactory, DeliveryNodeFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.helpers.fake_datetime import FakeDatetime, FakeDate
from eums.services import flow_scheduler as my_flow_scheduler


class FlowSchedulerTest(TestCase):
    def __backup_original_methods(self):
        self.original_app_task = local_celery.app.task
        self.original_periodic_task = celery.task.periodic_task
        self.original_rapid_pro_service_create_run = rapid_pro_service.create_run

    def __back_to_original(self):
        local_celery.app.task = self.original_app_task
        celery.task.periodic_task = self.original_periodic_task
        rapid_pro_service.create_run = self.original_rapid_pro_service_create_run
        self.flow_scheduler = reload(my_flow_scheduler)

    def __mock_ready(self):
        self.mock_celery = MockCelery()
        local_celery.app.task = self.mock_celery.task
        celery.task.periodic_task = MockPeriodicTask

        self.mocked_create_run = MagicMock()
        rapid_pro_service.create_run = self.mocked_create_run

        self.flow_scheduler = reload(my_flow_scheduler)

    def setUp(self):
        self.__backup_original_methods()
        self.__mock_ready()
        self.flow_scheduler.settings.RAPIDPRO_LIVE = True
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}

        self.node = NodeFactory()
        local_celery.app.control.revoke = MagicMock(return_value=None)
        self.node.build_contact = MagicMock(return_value=self.contact)
        Node.objects.get = MagicMock(return_value=self.node)
        Runnable.objects.get = MagicMock(return_value=self.node)

        self.ip_flow = FlowFactory(label=Flow.Label.IMPLEMENTING_PARTNER)
        self.end_user_flow = FlowFactory(label=Flow.Label.END_USER)
        self.middle_man_flow = FlowFactory(label=Flow.Label.MIDDLE_MAN)

        self.MIDDLEMAN_FLOW_ID = 1
        self.END_USER_FLOW_ID = 2
        self.IMPLEMENTING_PARTNER_FLOW_ID = 3

    def tearDown(self):
        self.flow_scheduler.settings.RAPIDPRO_LIVE = False
        Flow.objects.all().delete()
        Run.objects.all().delete()
        RunQueue.objects.all().delete()
        Node.objects.all().delete()
        self.__back_to_original()

    def test_should_schedule_middleman_flow_if_node_tree_position_is_middleman(self):
        node = NodeFactory(tree_position=Node.MIDDLE_MAN)
        node.build_contact = MagicMock(return_value=self.contact)

        Runnable.objects.get = MagicMock(return_value=node)

        self.flow_scheduler.schedule_run_for(node)

        self.mocked_create_run.assert_called_with(self.contact, self.middle_man_flow, ANY, ANY)

    def test_should_schedule_end_user_flow_if_node_tree_position_is_end_user(self):
        node = NodeFactory(tree_position=Node.END_USER)
        node.build_contact = MagicMock(return_value=self.contact)

        Runnable.objects.get = MagicMock(return_value=node)

        self.flow_scheduler.schedule_run_for(node)

        self.mocked_create_run.assert_called_with(self.contact, self.end_user_flow, ANY, ANY)

    def test_should_schedule_implementing_partner_flow_if_runnable_is_delivery(self):
        delivery = DeliveryFactory()
        NodeFactory(distribution_plan=delivery, item=PurchaseOrderItemFactory())
        delivery.build_contact = MagicMock(return_value=self.contact)

        Runnable.objects.get = MagicMock(return_value=delivery)

        self.flow_scheduler.schedule_run_for(delivery)

        self.mocked_create_run.assert_called_with(self.contact, self.ip_flow,
                                                  ANY, ANY)

    def test_should_schedule_a_flow_with_sender_as_unicef_if_node_has_no_parent(self):
        self.node.build_contact = MagicMock(return_value=self.contact)
        self.flow_scheduler.schedule_run_for(self.node)

        self.mocked_create_run.assert_called_with(self.contact, ANY, self.node.item.item.description, 'UNICEF')

    def test_should_schedule_flow_with_sender_as_parent_node_consignee_name_if_node_has_parent(self):
        sender_org_name = "Dwelling Places"
        sender_org = ConsigneeFactory(name=sender_org_name)
        parent_node = NodeFactory(consignee=sender_org)
        node = NodeFactory(consignee=sender_org, parents=[(parent_node, 10)])
        node.build_contact = MagicMock(return_value=self.contact)

        Runnable.objects.get = MagicMock(return_value=node)
        node.consignee.build_contact = MagicMock(return_value=self.contact)

        self.flow_scheduler.schedule_run_for(node)

        self.mocked_create_run.assert_called_with(self.contact, ANY, node.item.item.description, sender_org_name)

    def test_should_save_a_run_with_task_id_and_phone_as_cache_after_scheduling_the_flow(self):
        self.flow_scheduler.schedule_run_for(self.node)

        run_set = self.node.run_set.all()

        self.assertEqual(len(run_set), 1)
        self.assertEqual(run_set[0].phone, self.contact['phone'])
        self.assertEqual(run_set[0].scheduled_message_task_id, self.mock_celery.task_id)

    def test_should_schedule_flow_to_start_at_specific_time_after_expected_date_of_delivery(self):
        with patch('eums.services.flow_scheduler.datetime') as mock_datetime:
            mock_datetime.datetime.now.return_value = FakeDatetime.now()
            mock_datetime.datetime.combine.side_effect = datetime.datetime.combine
            mock_datetime.datetime.min.time.side_effect = datetime.datetime.min.time
            mock_datetime.timedelta.side_effect = datetime.timedelta

            self.flow_scheduler.schedule_run_for(self.node)

            self.assertEqual(self.mock_celery.invoked_after, 604800.0)

    def test_should_schedule_flow_to_start_after_buffer_when_calculated_send_time_is_in_past(self):
        some_date = FakeDate.today() - datetime.timedelta(days=10)
        node = NodeFactory(delivery_date=some_date)
        node.build_contact = MagicMock(return_value=self.contact)

        self.flow_scheduler.schedule_run_for(node)

        self.assertEqual(self.mock_celery.invoked_after, 10.0)

    def test_should_cancel_scheduled_run_for_consignee_before_scheduling_another_one_for_the_same_node(self):
        run = RunFactory(runnable=self.node)

        self.node.current_run = MagicMock(return_value=run)

        self.flow_scheduler.schedule_run_for(self.node)

        self.assertEqual(run.status, Run.STATUS.cancelled)

        local_celery.app.control.revoke.assert_called()

    def test_should_not_create_new_run_for_runnables_with_completed_run(self):
        RunFactory(runnable=self.node, status=Run.STATUS.completed)
        self.assertEqual(Run.objects.count(), 1)

        self.flow_scheduler.schedule_run_for(self.node)
        self.assertEqual(Run.objects.count(), 1)
        self.assertEqual(Run.objects.filter(runnable=self.node, status=Run.STATUS.scheduled).count(), 0)

    @patch('eums.models.RunQueue.enqueue')
    def test_should_queue_run_for_a_contact_if_contact_has_current_run_for_a_different_runnable(self,
                                                                                                mock_run_queue_enqueue):
        RunFactory(runnable=self.node)
        node_two = NodeFactory(contact_person_id=self.node.contact_person_id)
        node_two.build_contact = MagicMock(return_value=self.contact)
        mock_run_queue_enqueue.return_value = None
        self.flow_scheduler.schedule_run_for(node_two)

        mock_run_queue_enqueue.assert_called_with(node_two, ANY)

    @patch('eums.models.Run.overdue_runs')
    def test_should_expire_overdue_runs(self, mock_get_overdue_runs):
        run = RunFactory()
        mock_get_overdue_runs.return_value = [run]

        self.flow_scheduler.expire_overdue_runs()

        mock_get_overdue_runs.assert_called()
        self.assertEqual(run.status, Run.STATUS.expired)

    @patch('eums.models.RunQueue.dequeue')
    @patch('eums.services.flow_scheduler.schedule_run_for')
    @patch('eums.models.Run.overdue_runs')
    def test_should_schedule_queued_runs_for_a_consignee_after_expiring_over_due_runs(self, mock_get_overdue_runs,
                                                                                      mock_schedule_run_for,
                                                                                      mock_deque):
        overdue_run = RunFactory(runnable=self.node)
        node = NodeFactory()
        run_queue_item = RunQueueFactory(runnable=node,
                                         contact_person_id=self.node.contact_person_id)

        mock_get_overdue_runs.return_value = [overdue_run]
        mock_schedule_run_for.return_value = None
        mock_deque.return_value = run_queue_item

        self.flow_scheduler.expire_overdue_runs()

        mock_deque.assert_called_with(self.node.contact_person_id)
        mock_schedule_run_for.assert_called_with(run_queue_item.runnable)
        self.assertEqual(run_queue_item.status, RunQueue.STATUS.started)

    @patch('eums.services.flow_scheduler.expire_overdue_runs')
    def test_should_schedule_expire_runs_to_execute_at_midnight_every_day(self, mock_expire_overdue_runs):
        mock_expire_overdue_runs.return_value = None

        mock_expire_overdue_runs()

        MockPeriodicTask.assert_called_with(crontab(minute=0, hour=0))

    def test_is_distribution_expired_alert_not_raised_should_return_true(self):
        alert = AlertFactory(issue=Alert.ISSUE_TYPES.not_received)
        self.assertTrue(self.flow_scheduler.is_distribution_expired_alert_not_raised(alert.runnable))

    def test_is_distribution_expired_alert_not_raised_should_return_false(self):
        alert = AlertFactory(issue=Alert.ISSUE_TYPES.distribution_expired)
        self.assertFalse(self.flow_scheduler.is_distribution_expired_alert_not_raised(alert.runnable))

    def test_is_shipment_received_but_not_distributed_should_return_true(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label=Question.LABEL.deliveryReceived)
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery)
        DeliveryNodeFactory(distribution_plan=delivery, tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(distribution_plan=delivery, tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        self.assertTrue(self.flow_scheduler.is_shipment_received_but_not_distributed(delivery))

    def test_is_shipment_received_but_not_distributed_should_return_false(self):
        delivery = DeliveryFactory()
        question = MultipleChoiceQuestionFactory(label=Question.LABEL.deliveryReceived)
        option = OptionFactory(text='Yes', question=question)
        run = RunFactory(runnable=delivery)
        DeliveryNodeFactory(distribution_plan=delivery)
        DeliveryNodeFactory(distribution_plan=delivery, tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        MultipleChoiceAnswerFactory(run=run, question=question, value=option)

        self.assertFalse(self.flow_scheduler.is_shipment_received_but_not_distributed(delivery))

    def test_is_distribution_expired_should_return_true(self):
        delivery = DeliveryFactory(time_limitation_on_distribution=3)
        self.__prepare_for_is_distribution_expired_test(delivery)

        self.assertTrue(self.flow_scheduler.is_distribution_expired(delivery))

    def test_is_distribution_expired_should_return_false(self):
        delivery = DeliveryFactory(time_limitation_on_distribution=7)
        self.__prepare_for_is_distribution_expired_test(delivery)

        self.assertFalse(self.flow_scheduler.is_distribution_expired(delivery))

    def __prepare_for_is_distribution_expired_test(self, delivery):
        flow = Flow.objects.get(label=Flow.Label.IMPLEMENTING_PARTNER)
        question_is_received = MultipleChoiceQuestionFactory(label=Question.LABEL.deliveryReceived, flow=flow)
        question_received_date = TextQuestionFactory(label=Question.LABEL.dateOfReceipt, flow=flow)
        option_is_received = OptionFactory(text='Yes', question=question_is_received)
        run = RunFactory(runnable=delivery)
        DeliveryNodeFactory(distribution_plan=delivery, tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        DeliveryNodeFactory(distribution_plan=delivery, tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        MultipleChoiceAnswerFactory(run=run, question=question_is_received, value=option_is_received)
        datetime_span = (datetime.datetime.today() - datetime.timedelta(days=8)).strftime('%Y-%m-%dT%H:%M:%S')
        TextAnswerFactory(run=run, question=question_received_date, value=datetime_span)

    @patch('eums.services.flow_scheduler.distribution_alert_raise')
    def test_distribution_alert_raise_should_execute_at_midnight_every_day(self, mock_distribution_alert_raise):
        mock_distribution_alert_raise.return_value = None

        mock_distribution_alert_raise()

        MockPeriodicTask.assert_called_with(crontab(minute=0, hour=0))
