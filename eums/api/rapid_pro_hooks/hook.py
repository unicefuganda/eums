import ast

from celery.utils.log import get_task_logger
from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from eums.models import Run, RunQueue, Flow, Question
from eums.rapid_pro.rapid_pro_service import rapid_pro_service, RapidProService
from eums.services.flow_scheduler import schedule_run_for
from eums.services.response_alert_handler import ResponseAlertHandler


logger = get_task_logger(__name__)

# TODO-RAPID: code structure
@csrf_exempt
def hook(request):
    # TODO: Remove the try catch. This suppresses the errors and was added due to rapidPro flakiness
    try:
        params = request.POST
        logger.info("params %s:" % params)
        flow = rapid_pro_service.flow(params['flow'])
        run = Run.objects.filter(phone=params['phone'],
                                 status=Run.STATUS.scheduled).order_by('-id').first()
        answer = _save_answer(flow, params, run)

        if flow.is_end(answer):
            run.update_status(Run.STATUS.completed)
            _dequeue_next_run(run.runnable.contact_person_id)
            _raise_alert(params, run.runnable)
        return HttpResponse(status=200)

    except StandardError:
        return HttpResponse(status=200)


def _save_answer(flow, params, run):
    answer_values = ast.literal_eval(params['values'])
    latest_answer = answer_values[-1]
    question = Question.objects.filter(flow=flow, label=latest_answer['label']).first().get_subclass_instance()
    return question.create_answer(params, run)


def _raise_alert(params, runnable):
    answer_values = ast.literal_eval(params['values'])
    handler = ResponseAlertHandler(runnable, answer_values)
    handler.process()


def _dequeue_next_run(contact_person_id):
    next_run_queue = RunQueue.dequeue(contact_person_id=contact_person_id)
    if next_run_queue:
        _schedule_next_run(next_run_queue.runnable)
        next_run_queue.update_status(RunQueue.STATUS.started)


def _schedule_next_run(runnable):
    schedule_run_for(runnable)
