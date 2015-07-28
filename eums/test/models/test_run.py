from unittest import TestCase
import datetime

from eums import settings
from eums.models import Run, DistributionPlanNode
from eums.test.factories.answer_factory import MultipleChoiceAnswerFactory, NumericAnswerFactory
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.question_factory import MultipleChoiceQuestionFactory, TextQuestionFactory, \
    NumericQuestionFactory


class RunTest(TestCase):
    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.runnable = DistributionPlanNodeFactory(consignee=self.consignee)

    def tearDown(self):
        Run.objects.all().delete()
        DistributionPlanNode.objects.all().delete()

    def test_should_have_all_expected_fields(self):
        run = Run()
        fields_in_run = [field.attname for field in run._meta.fields]
        self.assertEqual(len(fields_in_run), 5)

        for field in ['scheduled_message_task_id', 'runnable_id', 'status', 'phone']:
            self.assertIn(field, fields_in_run)

    def test_should_get_current_run_for_consignee_with_run_with_status_scheduled(self):
        run = RunFactory(runnable=self.runnable)

        self.assertEqual(self.runnable.current_run(), run)

    def test_should_get_none_when_current_run_is_called_for_a_consignee_with_no_runs_scheduled(self):
        RunFactory(runnable=self.runnable, status=Run.STATUS.expired)
        RunFactory(runnable=self.runnable, status=Run.STATUS.completed)

        self.assertEqual(self.runnable.current_run(), None)

    def test_should_get_over_due_runs(self):
        delivery_status_check_delay = datetime.timedelta(days=settings.DELIVERY_STATUS_CHECK_DELAY)
        max_allowed_reply_period = datetime.timedelta(days=settings.MAX_ALLOWED_REPLY_PERIOD)
        one_day = datetime.timedelta(days=1)

        today = datetime.datetime.combine(datetime.date.today(), datetime.datetime.min.time())
        expired_run_date = today - delivery_status_check_delay - max_allowed_reply_period - one_day
        valid_run_date = today - delivery_status_check_delay - max_allowed_reply_period + one_day

        expired_run = RunFactory(status=Run.STATUS.scheduled,
                                 runnable=DistributionPlanNodeFactory(
                                     delivery_date=expired_run_date))
        RunFactory(status=Run.STATUS.scheduled,
                   runnable=DistributionPlanNodeFactory(
                       delivery_date=valid_run_date))

        overdue_runs = Run.overdue_runs()

        self.assertEqual(len(overdue_runs), 1)
        self.assertEqual(overdue_runs[0], expired_run)

    def test_should_not_get_completed_expired_or_cancelled_runs_when_getting_expired_runs(self):
        expired_run_date = datetime.date(1990, 1, 1)

        RunFactory(status=Run.STATUS.completed,
                   runnable=DistributionPlanNodeFactory(
                       delivery_date=expired_run_date))
        RunFactory(status=Run.STATUS.expired,
                   runnable=DistributionPlanNodeFactory(
                       delivery_date=expired_run_date))
        RunFactory(status=Run.STATUS.cancelled,
                   runnable=DistributionPlanNodeFactory(
                       delivery_date=expired_run_date))

        overdue_runs = Run.overdue_runs()

        self.assertEqual(len(overdue_runs), 0)

    def test_should_get_all_answers(self):
        run = RunFactory()

        multiple_answer_one = MultipleChoiceAnswerFactory(run=run)
        numeric_answer_one = NumericAnswerFactory(run=run)
        run_answers = run.answers()
        self.assertIn(multiple_answer_one, run_answers)
        self.assertIn(numeric_answer_one, run_answers)

    def test_should_get_all_questions_and_responses(self):
        run = RunFactory()

        item_received_question = MultipleChoiceQuestionFactory(label='product_received')
        yes = OptionFactory(question=item_received_question, text='Yes')
        item_received_question.multiplechoiceanswer_set.create(value=yes, run=run)

        date_received_question = TextQuestionFactory(label='date_received')
        date_received_question.textanswer_set.create(value='2014-01-01', run=run)

        quantity_received_question = NumericQuestionFactory(label='quantity_received')
        quantity_received_question.numericanswer_set.create(value=12, run=run)

        expected_data = {'product_received': 'Yes', 'quantity_received': 12, 'date_received': '2014-01-01'}
        self.assertDictEqual(run.questions_and_responses(), expected_data)

    def test_should_get_scheduled_runs_for_contact(self):
        runnable = DistributionPlanNodeFactory(contact_person_id=2)
        contact_person_id = 2

        self.assertEqual(Run.has_scheduled_run(contact_person_id), False)

        run = RunFactory(runnable=runnable)
        self.assertEqual(Run.has_scheduled_run(contact_person_id), True)

        run.status = Run.STATUS.completed
        run.save()
        self.assertEqual(Run.has_scheduled_run(contact_person_id), False)