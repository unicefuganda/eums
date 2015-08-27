from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from eums.models import Run, MultipleChoiceQuestion, TextQuestion, Flow, Runnable, NumericQuestion


@api_view(['POST', ])
def save_answers(request):
    request = request.data
    runnable = Runnable.objects.get(pk=(request['runnable']))
    contact = runnable.build_contact()

    cancel_existing_runs_for(runnable)

    run = Run.objects.create(runnable=runnable,
                             status=Run.STATUS.completed,
                             phone=contact['phone'] if contact else None,
                             scheduled_message_task_id='Web')

    flow = _get_flow(runnable)
    _create_answers(request['answers'], flow, run)
    runnable.confirm()
    return Response(status=status.HTTP_201_CREATED)


def _create_answers(raw_answers, flow, run):
    for answer in raw_answers:
        question = _get_matching_question(answer['question_label'], flow)
        params = {'values': [u'[{"category": {"eng":"%s"}, "label": "%s"}]' % (answer['value'], answer['question_label'])],
                  'text': answer['value']}
        question.create_answer(params, run)


def _get_flow(runnable):
    flow_type = Runnable.WEB if getattr(runnable, 'item', None) else Runnable.IMPLEMENTING_PARTNER
    return Flow.objects.get(for_runnable_type=flow_type)


def cancel_existing_runs_for(delivery):
    Run.objects.filter(runnable=delivery).update(status=Run.STATUS.cancelled)


def _get_matching_question(label, flow):
    multi_question = MultipleChoiceQuestion.objects.filter(label=label, flow=flow)
    text_question = TextQuestion.objects.filter(label=label, flow=flow)
    numeric_question = NumericQuestion.objects.filter(label=label, flow=flow)
    return text_question.first() or multi_question.first() or numeric_question.first()
