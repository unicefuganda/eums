import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from eums.models import DistributionPlanNode


class ConsigneeResponses(APIView):
    def get(self, request, consignee_id, *args, **kwargs):
        all_nodes = DistributionPlanNode.objects.filter(consignee__id=consignee_id)
        result = []
        for node in all_nodes:
            node_responses = node.responses()
            formatted_run_responses = {'node': node.id,  'consignee': {'id': node.consignee.id, 'name': node.consignee.name}}
            for item_run, responses in node_responses.iteritems():
                formatted_run_responses.update({'item': item_run.node_line_item.item.description,
                                                'amountSent': item_run.node_line_item.targeted_quantity})
                for response in responses:
                    formatted_run_responses.update({response.question.label: response.format()})
                result.append(formatted_run_responses)
        return Response(json.dumps(result), status=status.HTTP_200_OK)