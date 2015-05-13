import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from eums.models import DistributionPlanNode, DistributionPlanLineItem
from eums.models.answers import MultipleChoiceAnswer


class ResponseSerializer(object):
    def __init__(self, consignee_id=None):
        self.consignee_id = consignee_id

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
                                   'location': node.location,
                                   'consignee': {'id': node.consignee.id, 'name': node.consignee.name,
                                                 'type': node.tree_position}}
        return formatted_run_responses

    def node_responses(self, node):
        node_results = []
        node_responses = node.responses()
        programme = node.distribution_plan.programme
        formatted_run_responses = self.format_run_responses(node, programme)
        for item_run, responses in node_responses.iteritems():
            formatted_run_responses.update({'item': item_run.node_line_item.item.description,
                                            'amountSent': item_run.node_line_item.targeted_quantity})
            for response in responses:
                formatted_run_responses.update({response.question.label: response.format()})
            node_results.append(self.add_product_satisfied_field(formatted_run_responses))
        return node_results

    def detailed_node_responses(self, node_responses):
        node_results = {}
        for item_run, responses in node_responses.iteritems():
            for response in responses:
                response_value = response.value
                if type(response) is MultipleChoiceAnswer:
                    response_value = response.value_id

                node_results[response.question.label] =  {
                    'id': response.id,
                    'value': response_value,
                    'formatted_value': response.format(),
                }
        return node_results

    def serialize_responses(self, for_end_user=False):
        all_nodes = self.get_all_nodes(for_end_user)
        result = []
        for node in all_nodes:
            result = result + self.node_responses(node)
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


class PlanItemResponses(APIView):
    def get(self, request, plan_item_id, *args, **kwargs):
        planItem = DistributionPlanLineItem.objects.filter(id=plan_item_id).first()
        result = {}
        if planItem and planItem.distribution_plan_node.tree_position == 'END_USER':
            node_responses = planItem.distribution_plan_node.responses()
            line_item_run = node_responses.keys()[0]
            if node_responses:
                result = {
                    'node': self._get_node(planItem.distribution_plan_node),
                    'line_item_run_id': line_item_run.id,
                    'responses': ResponseSerializer().detailed_node_responses(node_responses)
                }

        return Response(result, status=status.HTTP_200_OK)

    def _get_node(self, node):
        return { 'id': node.id,
                'location': node.location,
                'consignee': node.consignee_id,
                'contact_person_id': node.contact_person_id,
                'plan_id': node.distribution_plan_id
               }