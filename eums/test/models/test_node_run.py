from unittest import TestCase

from eums.models import NodeRun


class NodeRunTest(TestCase):
    def test_should_have_all_expected_fields(self):
        node_run = NodeRun()
        fields_in_node_run = [field.attname for field in node_run._meta.fields]

        for field in ['scheduled_message_task_id', 'node_id', 'status']:
            self.assertIn(field, fields_in_node_run)