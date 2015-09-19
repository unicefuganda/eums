from django.db.models import Q

from eums.api.delivery_stats.stats_structure import RawStats
from eums.models import MultipleChoiceQuestion, Option, MultipleChoiceAnswer, Run, Runnable, Flow


def get_product_received_basic_values():
    end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
    was_product_received = MultipleChoiceQuestion.objects.get(label='productReceived', flow=end_user_flow)
    product_was_received = Option.objects.get(text='Yes', question=was_product_received)
    product_was_not_received = Option.objects.get(text='No', question=was_product_received)
    
    successful_delivery_answers = MultipleChoiceAnswer.objects.filter(
        question=was_product_received, value=product_was_received).filter(
        Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
    )
    
    unsuccessful_delivery_answers = MultipleChoiceAnswer.objects.filter(
        question=was_product_received, value=product_was_not_received).filter(
        Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
    )
    
    runs_with_answers = MultipleChoiceAnswer.objects.filter(question=was_product_received).values_list('run_id')
    
    return RawStats(successful_delivery_answers, unsuccessful_delivery_answers, runs_with_answers)
