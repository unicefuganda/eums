from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from eums.models import DistributionPlanNode as DeliveryNode
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

    def get_all_nodes(self, for_user):
        if for_user is DeliveryNode.END_USER:
            all_nodes = DeliveryNode.objects.filter(tree_position=DeliveryNode.END_USER)
        elif for_user is DeliveryNode.IMPLEMENTING_PARTNER:
            all_nodes = DeliveryNode.objects.filter(tree_position=DeliveryNode.IMPLEMENTING_PARTNER)
        else:
            all_nodes = DeliveryNode.objects.all()
        if self.consignee_id:
            all_nodes = DeliveryNode.objects.filter(consignee_id=self.consignee_id)
        return all_nodes

    @staticmethod
    def format_run_responses(node, programme):
        ip_dict = {'id': node.ip.id, 'location': node.ip.location} if node.ip else {'id': None, 'location': 'None'}
        formatted_run_responses = {'node': node.id,
                                   'ip': ip_dict,
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
            formatted_run_responses.update({'item': item_run.runnable.item.item.description,
                                            'amountSent': item_run.runnable.quantity_in(),
                                            'value': item_run.runnable.item.value
                                            })
            for response in responses:
                formatted_run_responses.update({response.question.label: response.format()})
            node_results.append(self.add_product_satisfied_field(formatted_run_responses))
        return node_results

    @staticmethod
    def detailed_node_responses(node_responses):
        node_results = {}
        for item_run, responses in node_responses.iteritems():
            for response in responses:
                response_value = response.value
                if type(response) is MultipleChoiceAnswer:
                    response_value = response.value_id

                node_results[response.question.label] = {
                    'id': response.id,
                    'value': response_value,
                    'formatted_value': response.format(),
                }
        return node_results

    def serialize_responses(self, for_user=None):
        all_nodes = self.get_all_nodes(for_user)
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
        result = ResponseSerializer().serialize_responses(for_user=DeliveryNode.END_USER)
        return Response(result, status=status.HTTP_200_OK)


class AllIPResponses(APIView):
    def get(self, request, *args, **kwargs):
        result = ResponseSerializer().serialize_responses(for_user=DeliveryNode.IMPLEMENTING_PARTNER)
        return Response(result, status=status.HTTP_200_OK)


class NodeResponses(APIView):
    def get(self, request, node_id, *args, **kwargs):
        planNode = DeliveryNode.objects.filter(id=node_id).first()
        result = {}
        if planNode and planNode.tree_position == 'END_USER':
            node_responses = planNode.responses()
            if node_responses:
                run = node_responses.keys()[0]
                result = {
                    'node': self._get_node(planNode),
                    'run_id': run.id,
                    'responses': ResponseSerializer().detailed_node_responses(node_responses)
                }

        return Response(result, status=status.HTTP_200_OK)

    def _get_node(self, node):
        return {'id': node.id,
                'location': node.location,
                'consignee': node.consignee_id,
                'contact_person_id': node.contact_person_id,
                'plan_id': node.distribution_plan_id
                }
