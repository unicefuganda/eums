from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanNode


def _generate_response_data(node):
    responses = node.responses()
    data = {'children': [], 'answers': {}}
    for node_run, answers in responses.iteritems():
        data.update({'node': node_run.node.consignee.name})
        for answer in answers:
            data['answers'].update({answer.question.label: answer.format()})
    return data


class PlanResponses(APIView):
    def get(self, _, consignee_id, sales_order_item_id):
        node = DistributionPlanNode.objects.filter(item_id=sales_order_item_id,
                                                   consignee_id=consignee_id).first()
        responses = self._get_responses_for_node(node)

        return Response(responses, status=status.HTTP_200_OK)

    def _get_responses_for_node(self, node):
        responses = _generate_response_data(node)
        for child_node in node.children.all():
            responses['children'].append(self._get_responses_for_node(child_node))
        return responses