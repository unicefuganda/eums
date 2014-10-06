from unittest import TestCase

from eums.models import RunQueue


class RunQueueTest(TestCase):
    def test_should_have_all_expected_fields(self):
        node_line_item_run = RunQueue()
        fields_in_run_queue = [field.attname for field in node_line_item_run._meta.fields]

        for field in ['node_line_item_id', 'contact_person_id', 'status', 'start_run_date']:
            self.assertIn(field, fields_in_run_queue)

    def test_can_deque_next_run_for_a_particular_contact_person(self):
        # RunQueueFactory()
        pass