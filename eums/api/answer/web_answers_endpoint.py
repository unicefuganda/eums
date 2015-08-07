from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from eums.models import DistributionPlan, Run, Question, MultipleChoiceQuestion, Option, TextQuestion

import ast


@api_view(['POST', ])
def save_answers(request):
    request = dict(request.data.iterlists())
    delivery_id = request['delivery'][0]
    answers = request['answers']
    delivery = DistributionPlan.objects.get(pk=delivery_id)
    contact = delivery.build_contact()

    run = Run.objects.create(runnable=delivery,
                             status=Run.STATUS.completed,
                             phone=contact['phone'],
                             scheduled_message_task_id='Web')

    for answer in answers:
        answer = ast.literal_eval(answer)
        question = _get_matching_question(answer['question_label'])

        if isinstance(question, MultipleChoiceQuestion):
            option = Option.objects.filter(text=answer['value'], question=question.id).first()
            question.multiplechoiceanswer_set.create(question=question, value=option, run=run)
        else:
            params = {'text': answer['value']}
            question.create_answer(params, run)

    return Response(status=status.HTTP_201_CREATED)


def _get_matching_question(label):
    text_question = TextQuestion.objects.filter(label=label)
    multi_question = MultipleChoiceQuestion.objects.filter(label=label)
    return (text_question or multi_question).first()