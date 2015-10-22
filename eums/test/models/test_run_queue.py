from unittest import TestCase

from eums.models import RunQueue
from eums.test.factories.RunQueueFactory import RunQueueFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory


class RunQueueTest(TestCase):
    def tearDown(self):
        RunQueue.objects.all().delete()

    def test_can_deque_next_run_for_a_particular_contact_person(self):
        contact_person_id = 'id'
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.started)
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.not_started, run_delay=1000.0)
        run_queue = RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.not_started,
                                    run_delay=1500.0)

        self.assertEqual(RunQueue.dequeue(contact_person_id), run_queue)

    def test_deque_returns_none_when_contact_person_no_pending_runs(self):
        contact_person_id = 'id'
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.started)
        RunQueueFactory(contact_person_id=contact_person_id, status=RunQueue.STATUS.started, run_delay=1000.0)

        self.assertEqual(RunQueue.dequeue(contact_person_id), None)

    def test_queues_run_for_particular_line_item_node(self):
        contact_person_id = 'id'
        run_delay = 1000

        node = DeliveryNodeFactory(contact_person_id=contact_person_id)

        RunQueue.enqueue(node, run_delay)
        queued_run = RunQueue.dequeue(contact_person_id)

        self.assertEqual(queued_run.status, RunQueue.STATUS.not_started)
        self.assertEqual(queued_run.contact_person_id, contact_person_id)

    def test_should_update_runqueue_status(self):
        runqueue = RunQueueFactory(contact_person_id='id', status=RunQueue.STATUS.started)

        runqueue.update_status(RunQueue.STATUS.not_started)

        updated_runqueue = RunQueue.objects.get(id=runqueue.id)

        self.assertEqual(updated_runqueue.status, RunQueue.STATUS.not_started)

