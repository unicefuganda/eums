from django.http.response import HttpResponse

from eums.models import Question, MultipleChoiceAnswer, Consignee
from eums.models import DistributionPlanLineItem as LineItem
from eums.models import DistributionPlanNode as Node


def hook(request):
    params = request.GET
    value = __get_value(params)
    return HttpResponse(status=200)


def __get_value(params):
    matching_question = Question.objects.get(uuids=params['step'])
    value = filter(lambda v: matching_question.label == v['label'], params['values'])[0]
    if matching_question.type is Question.MULTIPLE_CHOICE:
        matching_option = matching_question.option_set.get(text=value['category'])
        MultipleChoiceAnswer.objects.create(question=matching_question, value=matching_option)
        run = __find_line_item_run_for(params['phone'])
    return {}


def __find_line_item_run_for(phone):
    consignees = Consignee.get_consignees_with_phone(phone)
    for consignee in consignees:
        nodes = Node.objects.filter(consignee=consignee)
        line_item = LineItem.objects.all()
        return {}
    return None