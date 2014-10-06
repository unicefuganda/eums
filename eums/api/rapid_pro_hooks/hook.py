from django.http.response import HttpResponse
from django.utils.http import urlunquote_plus
from eums.models import Question, Option, MultipleChoiceAnswer


def hook(request):
    params = request.GET
    phone = params['phone']
    step = params['step']
    values = params['values']
    print "*" * 20, values, "*" * 20
    value = __get_value(step, values)
    return HttpResponse(status=200)


def __get_value(params):
    matching_question = Question.objects.get(uuids=params['step'])
    value = filter(lambda v: matching_question.label == v['label'], params['values'])[0]
    if matching_question.type is Question.MULTIPLE_CHOICE:
        matching_option = matching_question.option_set.get(text=value['category'])
        MultipleChoiceAnswer.objects.create(question=matching_question, value=matching_option)
        node_run = __find_node_run_for(params['phone'])


def __find_node_run_for(phone):

    return None