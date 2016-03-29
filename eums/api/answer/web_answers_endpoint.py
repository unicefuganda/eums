import ast

from celery.utils.log import get_task_logger
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.conf import settings

from eums.permissions.web_answer_permissions import WebAnswerPermissions
from eums.models import Run, Flow, Runnable, RunQueue
from eums.services import flow_scheduler
from eums.services.flow_scheduler import schedule_run_for
from eums.services.response_alert_handler import ResponseAlertHandler

logger = get_task_logger(__name__)


class WebAnswerEndpoint(APIView):
    permission_classes = (WebAnswerPermissions,)

    def post(self, request):
        return save_answers(request)


def save_answers(request):
    logger.info("start to save answers")
    request = request.data
    runnable = Runnable.objects.get(pk=(request['runnable']))
    cancel_existing_runs_for(runnable)

    run = Run.objects.create(runnable=runnable, status=Run.STATUS.completed,
                             phone=runnable.contact.phone, scheduled_message_task_id='Web')

    flow = _get_flow(runnable)
    rapid_pro_formatted_answers = _process_answers(request['answers'], flow, run)
    _create_alert(run.runnable, rapid_pro_formatted_answers)
    runnable.confirm()
    logger.info("ready to schedule a flow")
    _dequeue_next_run_for(runnable)

    if settings.CELERY_LIVE:
        flow_scheduler.distribution_alert_raise.delay()
    else:
        flow_scheduler.distribution_alert_raise()
    return Response(status=status.HTTP_201_CREATED)


def _dequeue_next_run_for(runnable):
    next_run = RunQueue.dequeue(contact_person_id=runnable.contact_person_id)
    logger.info("next run is %s" % next_run)
    if next_run:
        schedule_run_for(next_run.runnable)
        next_run.update_status(RunQueue.STATUS.started)


def _process_answers(raw_answers, flow, run):
    rapid_pro_formatted_answers = []
    for answer in raw_answers:
        question = flow.question_with(label=answer['question_label'])
        params = {'values': [u'[{"category": {"eng":"%s", "base": "%s"}, "label": "%s"}]' %
                             (answer['value'].replace('"', '\\"'), answer['value'].replace('"', '\\"'),
                              answer['question_label'])],
                  'text': answer['value']}
        question.create_answer(params, run)
        params_values = ast.literal_eval(params['values'][0])
        rapid_pro_formatted_answers.append(params_values[0])
    return rapid_pro_formatted_answers


def _create_alert(runnable, params):
    handler = ResponseAlertHandler(runnable, params)
    handler.process()


def _get_flow(runnable):
    flow_type = Flow.Label.WEB if getattr(runnable, 'item', None) else Flow.Label.IMPLEMENTING_PARTNER
    return Flow.objects.get(label=flow_type)


def cancel_existing_runs_for(delivery):
    Run.objects.filter(runnable=delivery).update(status=Run.STATUS.cancelled)
