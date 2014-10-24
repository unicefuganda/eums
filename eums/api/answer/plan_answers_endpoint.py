from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanLineItem


class PlanResponses(APIView):
    def get(self, _, consignee_id, sales_order_item_id):
        line_item = DistributionPlanLineItem.objects.filter(item_id=sales_order_item_id,
                                                            distribution_plan_node__consignee_id=consignee_id).first()
        parent_node = line_item.distribution_plan_node
        responses = self._get_responses_for_node(parent_node)

        return Response(responses, status=status.HTTP_200_OK)

    def _get_responses_for_node(self, node):
        responses = self._generate_response_data(node)
        for child_node in node.children.all():
            responses['children'].append(self._get_responses_for_node(child_node))
        return responses

    def _generate_response_data(self, node):
        responses = node.responses()
        data = {'children': [], 'answers': {}}
        for line_item_run, answers in responses.iteritems():
            data.update({'node': line_item_run.node_line_item.distribution_plan_node.consignee.name})
            for answer in answers:
                data['answers'].update({answer.question.label: answer.format()})
        return data