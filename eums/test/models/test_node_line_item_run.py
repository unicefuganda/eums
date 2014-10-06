from unittest import TestCase

from eums.models import NodeLineItemRun


class NodeLineItemRunTest(TestCase):
    def test_should_have_all_expected_fields(self):
        fields_in_node_line_item_run = NodeLineItemRun()._meta._name_map

        for field in ['scheduled_message_task_id', 'node_line_item_id', 'status']:
            self.assertIn(field, fields_in_node_line_item_run)