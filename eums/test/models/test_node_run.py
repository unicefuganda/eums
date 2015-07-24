from unittest import TestCase
import datetime

from eums import settings
from eums.models import NodeRun, DistributionPlanNode
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, NumericAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.node_run_factory import NodeRunFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory


class NodeRunTest(TestCase):
    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.node = DistributionPlanNodeFactory(consignee=self.consignee)

    def tearDown(self):
        NodeRun.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        node_run = NodeRun()
        fields_in_node_run = [field.attname for field in node_run._meta.fields]
        self.assertEqual(len(fields_in_node_run), 5)

        for field in ['scheduled_message_task_id', 'node_id', 'status', 'phone']:
            self.assertIn(field, fields_in_node_run)

    def test_should_get_current_run_for_consignee_with_run_with_status_scheduled(self):
        node_run = NodeRunFactory(node=self.node)

        self.assertEqual(NodeRun.current_run_for_node(self.node), node_run)

    def test_should_get_none_when_current_run_is_called_for_a_consignee_with_no_runs_scheduled(self):
        NodeRunFactory(node=self.node, status=NodeRun.STATUS.expired)
        NodeRunFactory(node=self.node, status=NodeRun.STATUS.completed)

        self.assertEqual(NodeRun.current_run_for_node(self.node), None)

    def test_should_get_over_due_runs(self):
        delivery_status_check_delay = datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
        max_allowed_reply_period = datetime.timedelta(days=settings.MAX_ALLOWED_REPLY_PERIOD)
        one_day = datetime.timedelta(days=1)

        today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
        expired_run_date = today - delivery_status_check_delay - max_allowed_reply_period - one_day
        valid_run_date = today - delivery_status_check_delay - max_allowed_reply_period + one_day

        expired_run = NodeRunFactory(status=NodeRun.STATUS.scheduled,
                                     node=DistributionPlanNodeFactory(
                                         delivery_date=expired_run_date))
        NodeRunFactory(status=NodeRun.STATUS.scheduled,
                       node=DistributionPlanNodeFactory(
                           delivery_date=valid_run_date))

        overdue_runs = NodeRun.overdue_runs()

        self.assertEqual(len(overdue_runs), 1)
        self.assertEqual(overdue_runs[0], expired_run)

    def test_should_not_get_completed_expired_or_cancelled_runs_when_getting_expired_runs(self):
        expired_run_date = datetime.date(1990, 1, 1)

        NodeRunFactory(status=NodeRun.STATUS.completed,
                       node=DistributionPlanNodeFactory(
                           delivery_date=expired_run_date))
        NodeRunFactory(status=NodeRun.STATUS.expired,
                       node=DistributionPlanNodeFactory(
                           delivery_date=expired_run_date))
        NodeRunFactory(status=NodeRun.STATUS.cancelled,
                       node=DistributionPlanNodeFactory(
                           delivery_date=expired_run_date))

        overdue_runs = NodeRun.overdue_runs()

        self.assertEqual(len(overdue_runs), 0)

    def test_should_get_all_answers(self):
        run = NodeRunFactory()

        multiple_answer_one = MultipleChoiceAnswerFactory(node_run=run)
        numeric_answer_one = NumericAnswerFactory(node_run=run)
        node_run_answers = run.answers()
        self.assertIn(multiple_answer_one, node_run_answers)
        self.assertIn(numeric_answer_one, node_run_answers)

    def test_should_get_all_questions_and_responses(self):
        run = NodeRunFactory()

        item_received_question = MultipleChoiceQuestionFactory(label='product_received')
        yes = OptionFactory(question=item_received_question, text='Yes')
        item_received_question.multiplechoiceanswer_set.create(value=yes, node_run=run)

        date_received_question = TextQuestionFactory(label='date_received')
        date_received_question.textanswer_set.create(value='2014-01-01', node_run=run)

        quantity_received_question = NumericQuestionFactory(label='quantity_received')
        quantity_received_question.numericanswer_set.create(value=12, node_run=run)

        expected_data = {'product_received': 'Yes', 'quantity_received': 12, 'date_received': '2014-01-01'}
        self.assertDictEqual(run.questions_and_responses(), expected_data)
