import datetime

from rest_framework.response import Response
from rest_framework.views import APIView

from eums import settings
from eums.api.delivery_stats.stats_search_data import EndUserStatsSearchData, IpStatsSearchData, StatsSearchDataFactory
from eums.models import DistributionPlanNode as DeliveryNode, MultipleChoiceAnswer

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

    def get(self, request, *args, **kwargs):
        tree_position = request.GET.get('treePosition', DeliveryNode.IMPLEMENTING_PARTNER)
        stats_search_data = StatsSearchDataFactory.create(tree_position)
        stats_search_data.filter_nodes(request)
        data = self._aggregate_nodes_states(stats_search_data)
        return Response(data, status=200)

    @staticmethod
    def _aggregate_nodes_states(stats_search_data):
        all_locations_with_nodes = stats_search_data.nodes.values_list('location', flat=True).distinct()
        return [DeliveryState(location, stats_search_data).state() for location in all_locations_with_nodes]


class DeliveryState:
    def __init__(self, location_name, search_data):
        self.location = location_name
        self.nodes = search_data.nodes
        self.search_data = search_data

    def state(self):
        nodes_in_location = self.nodes.filter(location=self.location)
        answers = MultipleChoiceAnswer.objects.filter(question__flow=self.search_data.flow, run__runnable__in=nodes_in_location)
        nodes_with_answers = answers.values_list('run__runnable')
        non_responses = self._get_non_responses(nodes_with_answers, nodes_in_location)
        number_received = answers.filter(question__label=self.search_data.received_label, value__text='Yes')
        number_not_received = answers.filter(question__label=self.search_data.received_label, value__text='No')
        has_no_issues = answers.filter(question__label=self.search_data.quality_label, value__text=self.search_data.quality_yes_text)
        has_issues = answers.filter(question__label=self.search_data.quality_label).exclude(value__text=self.search_data.quality_yes_text)

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
