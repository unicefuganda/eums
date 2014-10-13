from django.http.response import HttpResponse
from eums.models import NodeLineItemRun, RunQueue, Flow
from eums.models.question import NumericQuestion, TextQuestion, MultipleChoiceQuestion
from eums.services.flow_scheduler import schedule_run_for


def hook(request):
    params = request.GET
    flow = Flow.objects.get(rapid_pro_id=params['flow'])
    node_line_item_run = NodeLineItemRun.objects.filter(phone=params['phone']).first()

    question = _get_matching_question([params['step']])
    answer = question.create_answer(params, node_line_item_run)

    if flow.is_end(answer):
        _mark_as_complete(node_line_item_run)
        _dequeue_next_run(node_line_item_run)

    return HttpResponse(status=200)


def _dequeue_next_run(line_item_run):
    next_run = RunQueue.dequeue(contact_person_id=line_item_run.consignee.contact_person_id)
    schedule_run_for(next_run.node_line_item)
    next_run.status = RunQueue.STATUS.started
    next_run.save()


def _mark_as_complete(node_line_item_run):
    node_line_item_run.status = NodeLineItemRun.STATUS.completed
    node_line_item_run.save()


def _get_matching_question(uuid):
    numeric_question = NumericQuestion.objects.filter(uuids=uuid)
    text_question = TextQuestion.objects.filter(uuids=uuid)
    multi_question = MultipleChoiceQuestion.objects.filter(uuids__contains=uuid)
    return (numeric_question or text_question or multi_question).first()
