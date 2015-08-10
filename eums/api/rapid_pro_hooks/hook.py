from celery.utils.log import get_task_logger

from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from eums.models import Run, RunQueue, Flow
from eums.models.question import NumericQuestion, TextQuestion, MultipleChoiceQuestion
from eums.services.flow_scheduler import schedule_run_for

logger = get_task_logger(__name__)


@csrf_exempt
def hook(request):
    # TODO: Remove the try catch. This suppresses the errors and was added due to rapidPro flakiness
    try:
        params = request.POST
        logger.info("params %s:" % params)
        flow = Flow.objects.get(rapid_pro_id=params['flow'])
        run = Run.objects.filter(
            phone=params['phone'],
            status=Run.STATUS.scheduled).order_by('-id').first()

        question = _get_matching_question([params['step']])
        answer = question.create_answer(params, run)

        if flow.is_end(answer):
            _mark_as_complete(run)
            _dequeue_next_run(run.runnable.contact_person_id)
        return HttpResponse(status=200)

    except StandardError:
        return HttpResponse(status=200)


def _dequeue_next_run(contact_person_id):
    next_run = RunQueue.dequeue(contact_person_id=contact_person_id)
    if next_run:
        _schedule_next_run(next_run.runnable)
        next_run.status = RunQueue.STATUS.started
        next_run.save()


def _schedule_next_run(runnable):
    schedule_run_for(runnable)


def _mark_as_complete(run):
    run.status = Run.STATUS.completed
    run.save()


def _get_matching_question(uuid):
    numeric_question = NumericQuestion.objects.filter(uuids__contains=uuid)
    text_question = TextQuestion.objects.filter(uuids__contains=uuid)
    multi_question = MultipleChoiceQuestion.objects.filter(uuids__contains=uuid)
    return (numeric_question or text_question or multi_question).first()