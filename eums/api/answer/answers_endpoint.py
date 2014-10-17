from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from eums.models import DistributionPlanNode


class Responses(APIView):
    def get(self, request, *args, **kwargs):
        all_nodes = DistributionPlanNode.objects.filter(parent__isnull=False)
        result = []
        for node in all_nodes:
            node_responses = node.responses()
            for item_run, responses in node_responses.iteritems():
                formatted_run_responses = {'item': item_run.node_line_item.item.description, 'details': []}
                for response in responses:
                    question_reponse_map = {'questionLabel': response.question.label, 'answer': response.format()}
                    formatted_run_responses['details'].append(question_reponse_map)
                result.append(formatted_run_responses)
        return Response(json.dumps(result), status=status.HTTP_200_OK)