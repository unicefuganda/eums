from django.http.response import HttpResponse
from eums.models import NodeLineItemRun
from eums.models.question import NumericQuestion, TextQuestion, MultipleChoiceQuestion


def hook(request):
    params = request.GET
    __create_answer(params)

    return HttpResponse(status=200)


def __create_answer(params):
    line_item_run = NodeLineItemRun.objects.filter(phone=params['phone']).first()
    question = __get_matching_question(params['step'])
    question.create_answer(params, line_item_run)


def __get_matching_question(uuid):
    numeric_question = NumericQuestion.objects.filter(uuids=uuid)
    text_question = TextQuestion.objects.filter(uuids=uuid)
    multi_question = MultipleChoiceQuestion.objects.filter(uuids=uuid)
    return (numeric_question or text_question or multi_question).first()