import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from eums.models import DistributionPlanNode


class ResponseSerializer(object):
    def __init__(self, consignee_id=None):
        self.consignee_id = consignee_id

    @staticmethod
    def add_product_received_field(responses):
        if 'productReceived' not in responses:
            responses['productReceived'] = 'No'
        return responses

    @staticmethod
    def add_product_satisfied_field(responses):
        if 'satisfiedWithProduct' not in responses:
            if responses['productReceived'].lower() == 'yes':
                responses['satisfiedWithProduct'] = 'No'
        return responses

    def get_all_nodes(self, for_end_user):
        if for_end_user:
            all_nodes = DistributionPlanNode.objects.filter(tree_position='END_USER')
        else:
            all_nodes = DistributionPlanNode.objects.all()
        if self.consignee_id:
            all_nodes = DistributionPlanNode.objects.filter(consignee_id=self.consignee_id)
        return all_nodes

    @staticmethod
    def format_run_responses(node, programme):
        formatted_run_responses = {'node': node.id,
                                   'ip': node.get_ip(),
                                   'programme': {'id': programme.id, 'name': programme.name},
                                   'consignee': {'id': node.consignee.id, 'name': node.consignee.name,
                                                 'type': node.tree_position}}
        return formatted_run_responses

    def serialize_responses(self, for_end_user=False):
        all_nodes = self.get_all_nodes(for_end_user)
        result = []
        for node in all_nodes:
            node_responses = node.responses()
            programme = node.distribution_plan.programme
            formatted_run_responses = self.format_run_responses(node, programme)
            for item_run, responses in node_responses.iteritems():
                formatted_run_responses.update({'item': item_run.node_line_item.item.description,
                                                'amountSent': item_run.node_line_item.targeted_quantity})
                for response in responses:
                    formatted_run_responses.update({response.question.label: response.format()})
                formatted_run_responses_with_product_received = self.add_product_received_field(formatted_run_responses)
                result.append(self.add_product_satisfied_field(formatted_run_responses_with_product_received))
        return result


class ConsigneeResponses(APIView):
    def get(self, request, consignee_id, *args, **kwargs):
        result = ResponseSerializer(consignee_id).serialize_responses()
        return Response(result, status=status.HTTP_200_OK)


class AllConsigneeResponses(APIView):
    def get(self, request, *args, **kwargs):
        result = ResponseSerializer().serialize_responses()
        return Response(result, status=status.HTTP_200_OK)


class AllEndUserResponses(APIView):
    def get(self, request, *args, **kwargs):
        result = ResponseSerializer().serialize_responses(for_end_user=True)
        return Response(result, status=status.HTTP_200_OK)