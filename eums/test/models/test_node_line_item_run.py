from unittest import TestCase

from eums.models import NodeLineItemRun


class NodeLineItemRunTest(TestCase):
    def test_should_have_all_expected_fields(self):
        node_line_item_run = NodeLineItemRun()
        fields_in_node_line_item_run = [field.attname for field in node_line_item_run._meta.fields]
        self.assertEqual(len(fields_in_node_line_item_run), 5)

        for field in ['scheduled_message_task_id', 'node_line_item_id', 'status', 'phone']:
            self.assertIn(field, fields_in_node_line_item_run)