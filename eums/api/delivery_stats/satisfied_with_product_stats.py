from django.db.models import Q
from eums.api.delivery_stats.stats_structure import BaseQuerySets

from eums.models import MultipleChoiceQuestion, Option, MultipleChoiceAnswer, Run, Runnable, Flow


def get_satisfied_with_product_base_query_sets():
    end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
    satisfied_with_product_qn = MultipleChoiceQuestion.objects.get(label='satisfiedWithProduct', flow=end_user_flow)
    satisfied = Option.objects.get(text='Yes', question=satisfied_with_product_qn)
    unsatisfied = Option.objects.get(text='No', question=satisfied_with_product_qn)

    satisfied_with_product_answers = MultipleChoiceAnswer.objects.filter(
        question=satisfied_with_product_qn, value=satisfied).filter(
        Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
    )

    unsatisfied_with_product_answers = MultipleChoiceAnswer.objects.filter(
        question=satisfied_with_product_qn, value=unsatisfied).filter(
        Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
    )

    runs_with_answers = MultipleChoiceAnswer.objects.filter(question=satisfied_with_product_qn).values_list('run_id')

    return BaseQuerySets(satisfied_with_product_answers, unsatisfied_with_product_answers, runs_with_answers)
