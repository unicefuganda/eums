from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from eums.models import DistributionPlan, Run, MultipleChoiceQuestion, Option, TextQuestion, Flow, Runnable


@api_view(['POST', ])
def save_answers(request):
    request = request.data
    runnable_id = request['runnable']
    answers = request['answers']
    runnable = Runnable.objects.get(pk=runnable_id)
    contact = runnable.build_contact()

    cancel_existing_runs_for(runnable)

    run = Run.objects.create(runnable=runnable,
                             status=Run.STATUS.completed,
                             phone=contact['phone'] if contact else None,
                             scheduled_message_task_id='Web')

    ip_flow = Flow.objects.get(for_runnable_type=Runnable.IMPLEMENTING_PARTNER)

    for answer in answers:
        question = _get_matching_question(answer['question_label'], ip_flow)

        if isinstance(question, MultipleChoiceQuestion):
            option = Option.objects.filter(text=answer['value'], question=question.id).first()
            question.answers.create(question=question, value=option, run=run)
        else:
            params = {'text': answer['value']}
            question.create_answer(params, run)

    return Response(status=status.HTTP_201_CREATED)


def cancel_existing_runs_for(delivery):
    all_runs = Run.objects.filter(runnable=delivery)
    if all_runs:
        for delivery_run in all_runs:
            delivery_run.status = 'cancelled'
            delivery_run.save()


def _get_matching_question(label, flow):
    multi_question = MultipleChoiceQuestion.objects.filter(label=label, flow=flow)
    text_question = TextQuestion.objects.filter(label=label, flow=flow)

    return (text_question or multi_question).first()
