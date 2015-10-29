import datetime
from eums import settings
from rest_framework.response import Response

from rest_framework.views import APIView

from eums.models import Flow, Runnable, DistributionPlanNode, MultipleChoiceAnswer, Question

GRACE_PERIOD = settings.NON_RESPONSE_GRACE_PERIOD

X_PERCENT = settings.NON_RESPONSE_PERCENTAGE_THRESHOLD

STATE_CSS_MAPPING = {
    'NO_RESPONSE_EXPECTED': 'map-no-response-expected',
    'NON_RESPONSE': 'map-non-response',
    'NOT_RECEIVED': 'map-not-received',
    'RECEIVED': 'map-received',
    'RECEIVED_WITH_ISSUES': 'map-received-with-issues'
}


class MapDeliveryStatsEndpoint(APIView):
    def __init__(self):
        super(MapDeliveryStatsEndpoint, self).__init__()

    def get(self, request, *args, **kwargs):
        programme_id = request.GET.get('programme')
        selected_ip = request.GET.get('ip')
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        ip_nodes = DistributionPlanNode.objects.filter(tree_position=Runnable.IMPLEMENTING_PARTNER)
        if programme_id:
            ip_nodes = ip_nodes.filter(programme=programme_id)
        if selected_ip:
            ip_nodes = ip_nodes.filter(ip=selected_ip)
        if from_date:
            ip_nodes = ip_nodes.filter(delivery_date__gte=from_date)
        if to_date:
            ip_nodes = ip_nodes.filter(delivery_date__lte=to_date)

        data = self._aggregate_nodes_states(ip_nodes)
        return Response(data, status=200)

    @staticmethod
    def _aggregate_nodes_states(nodes):
        all_locations_with_nodes = nodes.values_list('location', flat=True).distinct()
        return [DeliveryState(location, nodes).state() for location in all_locations_with_nodes]


class DeliveryState:
    def __init__(self, location_name, nodes):
        self.location = location_name
        self.nodes = nodes
        self.IP_FLOW = Flow.objects.get(for_runnable_type=Runnable.IMPLEMENTING_PARTNER)

    def state(self):
        nodes_in_location = self.nodes.filter(location=self.location)
        answers = MultipleChoiceAnswer.objects.filter(question__flow=self.IP_FLOW, run__runnable__in=nodes_in_location)
        nodes_with_answers = answers.values_list('run__runnable')
        non_responses = self._get_non_responses(nodes_with_answers, nodes_in_location)
        number_received = answers.filter(question__label=Question.LABEL.deliveryReceived, value__text='Yes')
        number_not_received = answers.filter(question__label=Question.LABEL.deliveryReceived, value__text='No')
        has_no_issues = answers.filter(question__label=Question.LABEL.isDeliveryInGoodOrder, value__text='Yes')
        has_issues = answers.filter(question__label=Question.LABEL.isDeliveryInGoodOrder, value__text='No')

        data = {'location': self.location, 'numberOfDeliveries': nodes_in_location.count(),
                'nonResponse': non_responses.count(), 'numberReceived': number_received.count(),
                'numberNotReceived': number_not_received.count(), 'hasIssues': has_issues.count(),
                'noIssues': has_no_issues.count(), 'state': ''}
        data['state'] = self.get_state(data)
        return data

    @staticmethod
    def _get_non_responses(nodes_with_answers, nodes_in_location):
        grace_period_deadline = datetime.datetime.now() - datetime.timedelta(days=GRACE_PERIOD)
        return nodes_in_location.exclude(id__in=nodes_with_answers).filter(delivery_date__lte=grace_period_deadline)

    @staticmethod
    def get_state(data):
        if not data['numberOfDeliveries']:
            return STATE_CSS_MAPPING['NO_RESPONSE_EXPECTED']
        non_response_percent = 100 * data['nonResponse'] / data['numberOfDeliveries']
        if non_response_percent > X_PERCENT:
            return STATE_CSS_MAPPING['NON_RESPONSE']
        if data['numberNotReceived'] > data['numberReceived']:
            return STATE_CSS_MAPPING['NOT_RECEIVED']
        if data['noIssues'] > data['hasIssues'] or not data['hasIssues']:
            return STATE_CSS_MAPPING['RECEIVED']
        if data['noIssues'] <= data['hasIssues']:
            return STATE_CSS_MAPPING['RECEIVED_WITH_ISSUES']
        return STATE_CSS_MAPPING['NO_RESPONSE_EXPECTED']
