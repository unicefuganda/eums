import datetime
from django.db.models import Sum

from rest_framework.response import Response

from rest_framework.views import APIView

from eums import settings
from eums.api.delivery_stats.stats_search_data import StatsSearchDataFactory
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
        tree_position = request.GET.get('treePosition', DeliveryNode.END_USER)
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

    @staticmethod
    def _get_nodes_total_value(queryset):
        return queryset.aggregate(total_value=Sum('total_value'))['total_value'] or 0

    def state(self):
        nodes_in_location = self.nodes.filter(location=self.location)
        answers = MultipleChoiceAnswer.objects.filter(question__flow=self.search_data.flow,
                                                      run__runnable__in=nodes_in_location)
        nodes_with_answers = answers.values_list('run__runnable')

        non_responses_nodes = self._get_non_responses(nodes_with_answers, nodes_in_location)
        non_responses = self._get_nodes_total_value(non_responses_nodes)

        nodes_received_ids = answers.filter(question__label=self.search_data.received_label,
                                            value__text='Yes').values_list('run__runnable').distinct()
        value_received = self._get_nodes_total_value(nodes_in_location.filter(id__in=nodes_received_ids))

        nodes_not_received_ids = answers.filter(question__label=self.search_data.received_label,
                                                value__text='No').values_list('run__runnable').distinct()
        value_not_received = self._get_nodes_total_value(nodes_in_location.filter(id__in=nodes_not_received_ids))

        has_no_issues_ids = answers.filter(question__label=self.search_data.quality_label,
                                           value__text=self.search_data.quality_yes_text).values_list(
            'run__runnable').distinct()
        has_no_issues = self._get_nodes_total_value(nodes_in_location.filter(id__in=has_no_issues_ids))

        has_issues_ids = answers.filter(question__label=self.search_data.quality_label).exclude(
            value__text=self.search_data.quality_yes_text).values_list('run__runnable').distinct()
        has_issues = self._get_nodes_total_value(nodes_in_location.filter(id__in=has_issues_ids))

        deliveries = self._get_nodes_total_value(nodes_in_location)

        data = {'location': self.location, 'deliveries': deliveries, 'nonResponse': non_responses,
                'received': value_received, 'notReceived': value_not_received, 'hasIssues': has_issues,
                'noIssues': has_no_issues, 'state': ''}
        data['state'] = self.get_state(data)
        return data

    @staticmethod
    def _get_non_responses(nodes_with_answers, nodes_in_location):
        grace_period_deadline = datetime.datetime.now() - datetime.timedelta(days=GRACE_PERIOD)
        return nodes_in_location.exclude(id__in=nodes_with_answers).filter(delivery_date__lte=grace_period_deadline)

    @staticmethod
    def get_state(data):
        if not data['deliveries']:
            return STATE_CSS_MAPPING['NO_RESPONSE_EXPECTED']

        non_response_percent = 100 * data['nonResponse'] / data['deliveries']
        is_awaiting_response = non_response_percent < X_PERCENT and not data['notReceived'] and not data['received']
        if non_response_percent > X_PERCENT or is_awaiting_response:
            return STATE_CSS_MAPPING['NON_RESPONSE']
        if data['notReceived'] > data['received']:
            return STATE_CSS_MAPPING['NOT_RECEIVED']
        if data['noIssues'] > data['hasIssues']:
            return STATE_CSS_MAPPING['RECEIVED']
        if data['noIssues'] <= data['hasIssues']:
            return STATE_CSS_MAPPING['RECEIVED_WITH_ISSUES']
        return STATE_CSS_MAPPING['NO_RESPONSE_EXPECTED']
