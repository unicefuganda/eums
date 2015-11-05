from rest_framework.response import Response
from rest_framework.views import APIView

from eums.api.delivery_stats.stats_search_data import StatsSearchDataFactory
from eums.models import DistributionPlanNode as DeliveryNode, MultipleChoiceAnswer


class LatestDeliveriesEndpoint(APIView):
    def get(self, request, *args, **kwargs):
        tree_position = request.GET.get('treePosition', DeliveryNode.END_USER)
        stats_search_data = StatsSearchDataFactory.create(tree_position)
        stats_search_data.filter_nodes(request, sort_by='-delivery_date')
        data = LatestDeliveries(stats_search_data).data(limit=request.GET.get('limit'))
        return Response(data, status=200)


class LatestDeliveries:
    def __init__(self, search_data):
        self.nodes = search_data.nodes
        self.search_data = search_data

    def data(self, limit):
        limit = limit or 3
        answers = MultipleChoiceAnswer.objects.filter(question__flow=self.search_data.flow,
                                                      run__runnable__in=self.nodes)
        nodes_with_answers_ids = answers.values_list('run__runnable')
        nodes_with_answers = self.nodes.filter(id__in=nodes_with_answers_ids)[:limit]

        return [DeliveryData(node, self.search_data).data() for node in nodes_with_answers]


class DeliveryData:
    def __init__(self, node, search_data):
        self.node = node
        self.search_data = search_data

    def data(self):
        received_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.search_data.flow,
                                                              run__runnable=self.node,
                                                              question__label=self.search_data.received_label)
        good_condition_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.search_data.flow,
                                                                    run__runnable=self.node,
                                                                    question__label=self.search_data.quality_label)
        satisfied_answer = MultipleChoiceAnswer.objects.filter(question__flow=self.search_data.flow,
                                                               run__runnable=self.node,
                                                               question__label=self.search_data.satisfied_label)

        delivery_date = self.node.delivery_date.strftime("%d-%b-%Y")
        received = self._get_yes_or_no(received_answer)
        quality = self._get_yes_or_no(good_condition_answer)
        satisfied = self._get_yes_or_no(satisfied_answer)
        return {'deliveryName': '%s on %s' % (self.node.location, delivery_date), 'received': received,
                'inGoodCondition': quality, 'satisfied': satisfied}

    @staticmethod
    def _get_yes_or_no(received_answer):
        if not received_answer:
            return False
        _received_answer = received_answer.latest('created')
        return _received_answer.value.text == "Yes"
