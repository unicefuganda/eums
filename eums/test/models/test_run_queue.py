from datetime import datetime
from unittest import TestCase

from eums.models import RunQueue
from eums.test.factories.RunQueueFactory import RunQueueFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory


class RunQueueTest(TestCase):
    def tearDown(self):
        RunQueue.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        node_line_item_run = RunQueue()
        fields_in_run_queue = [field.attname for field in node_line_item_run._meta.fields]

        for field in ['node_line_item_id', 'contact_person_id', 'status', 'run_delay']:
            self.assertIn(field, fields_in_run_queue)

    def test_can_deque_next_run_for_a_particular_contact_person(self):
        contact_person_id = 'id'
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.started)
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.not_started,
                        run_delay=1000.0)
        run_queue = RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.not_started,
                                    run_delay=1500.0)

        self.assertEqual(RunQueue.deque(contact_person_id), run_queue)

    def test_deque_returns_none_when_contact_person_no_pending_runs(self):
        contact_person_id = 'id'
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.started)
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.started,
                        run_delay=1000.0)

        self.assertEqual(RunQueue.deque(contact_person_id), None)

    def test_queues_run_for_particular_line_item_node(self):
        contact_person_id = 'id'
        run_delay = 1000

        consignee = ConsigneeFactory(contact_person_id=contact_person_id)
        node = DistributionPlanNodeFactory(consignee=consignee)
        node_line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

        RunQueue.enqueue(node_line_item, run_delay)
        queued_run = RunQueue.deque(contact_person_id)

        self.assertEqual(queued_run.status, RunQueue.STATUS.not_started)
        self.assertEqual(queued_run.contact_person_id, contact_person_id)
