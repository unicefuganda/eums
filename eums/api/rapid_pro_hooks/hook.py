import ast
from django.http.response import HttpResponse

from eums.models import Question, MultipleChoiceAnswer, NodeLineItemRun, TextAnswer, NumericAnswer


def hook(request):
    params = request.GET
    __create_answer(params)

    return HttpResponse(status=200)


def __store_multiple_choice_answer(matching_question, value, line_item_run):
    matching_option = matching_question.option_set.get(text=value['category'])
    MultipleChoiceAnswer.objects.create(question=matching_question, value=matching_option,
                                        line_item_run=line_item_run)


def __store_text_answer(matching_question, value, line_item_run):
    TextAnswer.objects.create(question=matching_question, value=value, line_item_run=line_item_run)


def __store_numeric_answer(matching_question, value, line_item_run):
    NumericAnswer.objects.create(question=matching_question, value=value, line_item_run=line_item_run)


def __create_answer(params):
    line_item_run = NodeLineItemRun.objects.filter(phone=params['phone']).first()
    matching_question = Question.objects.get(uuids=params['step'])
    if matching_question.type == Question.MULTIPLE_CHOICE:
        values = ast.literal_eval(params['values'])
        value = filter(lambda v: matching_question.label == v['label'], values)[0]
        __store_multiple_choice_answer(matching_question, value, line_item_run)
    elif matching_question.type == Question.NUMERIC:
        value = params['text']
        __store_numeric_answer(matching_question, value, line_item_run)
    else:
        value = params['text']
        __store_text_answer(matching_question, value, line_item_run)
