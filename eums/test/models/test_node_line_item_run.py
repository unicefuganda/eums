from unittest import TestCase
import datetime

from eums import settings
from eums.models import NodeLineItemRun, DistributionPlanLineItem, DistributionPlanNode
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, NumericAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory


class NodeLineItemRunTest(TestCase):
    def setUp(self):
        self.consignee = ConsigneeFactory()
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        self.line_item = DistributionPlanLineItemFactory(distribution_plan_node=node)

    def tearDown(self):
        NodeLineItemRun.objects.all().delete()
        DistributionPlanLineItem.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        node_line_item_run = NodeLineItemRun()
        fields_in_node_line_item_run = [field.attname for field in node_line_item_run._meta.fields]
        self.assertEqual(len(fields_in_node_line_item_run), 5)

        for field in ['scheduled_message_task_id', 'node_line_item_id', 'status', 'phone']:
            self.assertIn(field, fields_in_node_line_item_run)

    def test_should_get_current_run_for_consignee_with_run_with_status_scheduled(self):
        line_item_run = NodeLineItemRunFactory(node_line_item=self.line_item)

        self.assertEqual(NodeLineItemRun.current_run_for_node(self.line_item.distribution_plan_node), line_item_run)

    def test_should_get_none_when_current_run_is_called_for_a_consignee_with_no_runs_scheduled(self):
        NodeLineItemRunFactory(node_line_item=self.line_item, status=NodeLineItemRun.STATUS.expired)
        NodeLineItemRunFactory(node_line_item=self.line_item, status=NodeLineItemRun.STATUS.completed)

        self.assertEqual(NodeLineItemRun.current_run_for_node(self.line_item.distribution_plan_node), None)

    def test_should_get_over_due_runs(self):
        delivery_status_check_delay = datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
        max_allowed_reply_period = datetime.timedelta(days=settings.MAX_ALLOWED_REPLY_PERIOD)
        one_day = datetime.timedelta(days=1)

        today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
        expired_run_date = today - delivery_status_check_delay - max_allowed_reply_period - one_day
        valid_run_date = today - delivery_status_check_delay - max_allowed_reply_period + one_day

        expired_line_item_run = NodeLineItemRunFactory(status=NodeLineItemRun.STATUS.scheduled,
                                                       node_line_item=DistributionPlanLineItemFactory(
                                                           planned_distribution_date=expired_run_date))
        NodeLineItemRunFactory(status=NodeLineItemRun.STATUS.scheduled,
                               node_line_item=DistributionPlanLineItemFactory(
                                   planned_distribution_date=valid_run_date))

        overdue_runs = NodeLineItemRun.overdue_runs()

        self.assertEqual(len(overdue_runs), 1)
        self.assertEqual(overdue_runs[0], expired_line_item_run)

    def test_should_not_get_completed_expired_or_cancelled_runs_when_getting_expired_runs(self):
        expired_run_date = datetime.date(1990, 1, 1)

        NodeLineItemRunFactory(status=NodeLineItemRun.STATUS.completed,
                               node_line_item=DistributionPlanLineItemFactory(
                                   planned_distribution_date=expired_run_date))
        NodeLineItemRunFactory(status=NodeLineItemRun.STATUS.expired,
                               node_line_item=DistributionPlanLineItemFactory(
                                   planned_distribution_date=expired_run_date))
        NodeLineItemRunFactory(status=NodeLineItemRun.STATUS.cancelled,
                               node_line_item=DistributionPlanLineItemFactory(
                                   planned_distribution_date=expired_run_date))

        overdue_runs = NodeLineItemRun.overdue_runs()
        self.assertEqual(len(overdue_runs), 0)

    def test_should_get_all_answers(self):
        run = NodeLineItemRunFactory()

        multiple_answer_one = MultipleChoiceAnswerFactory(line_item_run=run)
        numeric_answer_one = NumericAnswerFactory(line_item_run=run)
        line_item_run_answers = run.answers()
        self.assertIn(multiple_answer_one, line_item_run_answers)
        self.assertIn(numeric_answer_one, line_item_run_answers)

    def test_should_get_all_questions_and_responses(self):
        run = NodeLineItemRunFactory()

        item_received_question = MultipleChoiceQuestionFactory(label='product_received')
        yes = OptionFactory(question=item_received_question, text='Yes')
        item_received_question.multiplechoiceanswer_set.create(value=yes, line_item_run=run)

        date_received_question = TextQuestionFactory(label='date_received')
        date_received_question.textanswer_set.create(value='2014-01-01', line_item_run=run)

        quantity_received_question = NumericQuestionFactory(label='quantity_received')
        quantity_received_question.numericanswer_set.create(value=12, line_item_run=run)

        expected_data = {'product_received': 'Yes', 'quantity_received': 12, 'date_received': '2014-01-01'}
        self.assertDictEqual(run.questions_and_responses(), expected_data)
