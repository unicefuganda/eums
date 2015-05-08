from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from eums.models import NodeLineItemRun, RunQueue, Flow
from eums.models.question import NumericQuestion, TextQuestion, MultipleChoiceQuestion
from eums.services.flow_scheduler import schedule_run_for


@csrf_exempt
def hook(request):
    # TODO: Remove the try catch. This suppresses the errors and was added due to rapidPro flakiness
    try:
        params = request.POST
        flow = Flow.objects.get(rapid_pro_id=params['flow'])
        node_run = NodeLineItemRun.objects.filter(
            phone=params['phone'],
            status=NodeLineItemRun.STATUS.scheduled).order_by('-id').first()

        question = _get_matching_question([params['step']])
        answer = question.create_answer(params, node_run)

        if flow.is_end(answer):
            _mark_as_complete(node_run)
            _dequeue_next_run(node_run)
        return HttpResponse(status=200)

    except StandardError:
        return HttpResponse(status=200)


def _dequeue_next_run(node_run):
    next_run = RunQueue.dequeue(contact_person_id=node_run.node.distribution_plan_node.contact_person_id)
    if next_run:
        _schedule_next_run(next_run.node)
        next_run.status = RunQueue.STATUS.started
        next_run.save()


def _schedule_next_run(line_item):
    schedule_run_for(line_item)


def _mark_as_complete(node_run):
    node_run.status = NodeLineItemRun.STATUS.completed
    node_run.save()


def _get_matching_question(uuid):
    numeric_question = NumericQuestion.objects.filter(uuids__contains=uuid)
    text_question = TextQuestion.objects.filter(uuids__contains=uuid)
    multi_question = MultipleChoiceQuestion.objects.filter(uuids__contains=uuid)
    return (numeric_question or text_question or multi_question).first()