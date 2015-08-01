from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanNode


def _generate_response_data(runnable):
    responses = runnable.responses()
    data = {'children': [], 'answers': {}}
    for run, answers in responses.iteritems():
        data.update({'node': run.runnable.consignee.name})
        for answer in answers:
            data['answers'].update({answer.question.label: answer.format()})
    return data


class PlanResponses(APIView):
    def get(self, _, consignee_id, sales_order_item_id):
        runnable = DistributionPlanNode.objects.filter(item_id=sales_order_item_id, consignee_id=consignee_id).first()
        responses = self._get_responses_for_runnable(runnable)

        return Response(responses, status=status.HTTP_200_OK)

    def _get_responses_for_runnable(self, runnable):
        responses = _generate_response_data(runnable)
        for child_node in runnable.children():
            responses['children'].append(self._get_responses_for_runnable(child_node))
        return responses
