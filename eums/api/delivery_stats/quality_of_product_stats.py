from django.db.models import Q
from eums.api.delivery_stats.stats_structure import BaseQuerySets

from eums.models import MultipleChoiceQuestion, Option, MultipleChoiceAnswer, Run, Runnable, Flow


def get_quality_of_product_base_query_sets():
    end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
    quality_of_product_qn = MultipleChoiceQuestion.objects.get(label='qualityOfProduct', flow=end_user_flow)
    was_good = Option.objects.get(text='Good', question=quality_of_product_qn)

    good_quality_delivery_answers = MultipleChoiceAnswer.objects.filter(
        question=quality_of_product_qn, value=was_good).filter(
        Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
    )

    bad_order_delivery_answers = MultipleChoiceAnswer.objects.filter(
        question=quality_of_product_qn).filter(~Q(value=was_good)).filter(
        Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
    )

    runs_with_answers = MultipleChoiceAnswer.objects.filter(question=quality_of_product_qn).values_list('run_id')

    return BaseQuerySets(good_quality_delivery_answers, bad_order_delivery_answers, runs_with_answers)
