from decimal import Decimal

from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.views import APIView

from eums.api.delivery_stats.stats_search_data import StatsSearchDataFactory
from eums.api.delivery_stats.stats_structure import DeliveryStats
from eums.api.delivery_stats.stats_queries import get_product_received_base_query_sets, \
    get_quality_of_product_base_query_sets, get_satisfied_with_product_base_query_sets
from eums.models import DistributionPlanNode as DeliveryNode


class DeliveryStatsDetailsEndpoint(APIView):
    def get(self, request, *args, **kwargs):
        tree_position = request.GET.get('treePosition', DeliveryNode.END_USER)
        stats_search_data = StatsSearchDataFactory.create(tree_position)
        stats_search_data.filter_nodes(request)
        stats_details = DeliveryStatsDetails(stats_search_data)
        stats_details_data = stats_details.data()
        return Response(stats_details_data, status=200)


class DeliveryStatsDetails:
    def __init__(self, stats_search_data):
        self.stats_search_data = stats_search_data

    def data(self):
        product_received_stats = self._get_product_received_stats()
        quality_of_product_stats = self._get_quality_of_product_stats()
        satisfied_with_product_stats = self._get_satisfied_with_product_stats()

        return {
            'totalNumberOfDeliveries': self.total_deliveries(),
            'totalValueOfDeliveries': self.total_delivery_value(),

            'numberOfSuccessfulProductDeliveries': product_received_stats.count_positive,
            'numberOfUnsuccessfulProductDeliveries': product_received_stats.count_negative,
            'numberOfNonResponseToProductReceived': product_received_stats.count_non_response,

            'percentageOfSuccessfulDeliveries': product_received_stats.percent_positive,
            'percentageOfUnsuccessfulDeliveries': product_received_stats.percent_negative,
            'percentageOfNonResponseToProductReceived': product_received_stats.percent_non_response,

            'totalValueOfSuccessfulDeliveries': product_received_stats.value_positive,
            'totalValueOfUnsuccessfulProductDeliveries': product_received_stats.value_negative,
            'totalValueOfNonResponseToProductReceived': product_received_stats.value_non_response,

            'percentageValueOfSuccessfulDeliveries': product_received_stats.percent_value_positive,
            'percentageValueOfUnsuccessfulDeliveries': product_received_stats.percent_value_negative,
            'percentageValueOfNonResponseToProductReceived': product_received_stats.percent_value_non_response,

            'numberOfDeliveriesInGoodOrder': quality_of_product_stats.count_positive,
            'numberOfDeliveriesInBadOrder': quality_of_product_stats.count_negative,
            'numberOfNonResponseToQualityOfProduct': quality_of_product_stats.count_non_response,

            'percentageOfDeliveriesInGoodOrder': quality_of_product_stats.percent_positive,
            'percentageOfDeliveriesInBadOrder': quality_of_product_stats.percent_negative,
            'percentageOfNonResponseToQualityOfProduct': quality_of_product_stats.percent_non_response,

            'totalValueOfDeliveriesInGoodOrder': quality_of_product_stats.value_positive,
            'totalValueOfDeliveriesInBadOrder': quality_of_product_stats.value_negative,
            'totalValueOfNonResponseToQualityOfProduct': quality_of_product_stats.value_non_response,

            'percentageValueOfDeliveriesInGoodOrder': quality_of_product_stats.percent_value_positive,
            'percentageValueOfDeliveriesInBadOrder': quality_of_product_stats.percent_value_negative,
            'percentageValueOfNonResponseToQualityOfProduct': quality_of_product_stats.percent_value_non_response,

            'numberOfSatisfactoryDeliveries': satisfied_with_product_stats.count_positive,
            'numberOfUnsatisfactoryDeliveries': satisfied_with_product_stats.count_negative,
            'numberOfNonResponseToSatisfactionWithProduct': satisfied_with_product_stats.count_non_response,

            'percentageOfSatisfactoryDeliveries': satisfied_with_product_stats.percent_positive,
            'percentageOfUnsatisfactoryDeliveries': satisfied_with_product_stats.percent_negative,
            'percentageOfNonResponseToSatisfactionWithProduct': satisfied_with_product_stats.percent_non_response,

            'totalValueOfSatisfactoryDeliveries': satisfied_with_product_stats.value_positive,
            'totalValueOfUnsatisfactoryDeliveries': satisfied_with_product_stats.value_negative,
            'totalValueOfNonResponseToSatisfactionWithProduct': satisfied_with_product_stats.value_non_response,

            'percentageValueOfSatisfactoryDeliveries': satisfied_with_product_stats.percent_value_positive,
            'percentageValueOfUnsatisfactoryDeliveries': satisfied_with_product_stats.percent_value_negative,
            'percentageValueOfNonResponseToSatisfactionWithProduct': satisfied_with_product_stats.percent_value_non_response,
        }

    def total_deliveries(self):
        return self.stats_search_data.nodes.count()

    def total_delivery_value(self):
        return self._get_nodes_total_value(self.stats_search_data.nodes)

    def _get_product_received_stats(self):
        base_query_sets = get_product_received_base_query_sets(self.stats_search_data)
        return self._get_question_stats(base_query_sets)

    def _get_quality_of_product_stats(self):
        base_query_sets = get_quality_of_product_base_query_sets(self.stats_search_data)
        return self._get_question_stats(base_query_sets)

    def _get_satisfied_with_product_stats(self):
        base_query_sets = get_satisfied_with_product_base_query_sets(self.stats_search_data)
        return self._get_question_stats(base_query_sets)

    def _get_question_stats(self, raw_stats):
        positive_count = raw_stats.positive_answers.count()
        non_response_count = raw_stats.non_response_nodes.count()
        negative_count = raw_stats.negative_answers.count()

        percent_negative, percent_non_response, percent_positive = self._get_count_percentages(
            negative_count, non_response_count, positive_count)

        value_negative, value_non_response, value_positive = self._get_values(raw_stats)

        percent_value_negative, percent_value_non_response, percent_value_positive = self._get_value_percentages(
            value_negative, value_non_response, value_positive)

        return DeliveryStats(
            positive_count, negative_count, non_response_count,
            percent_positive, percent_negative, percent_non_response,
            value_positive, value_negative, value_non_response,
            percent_value_positive, percent_value_negative, percent_value_non_response
        )

    def _get_value_percentages(self, value_negative, value_non_response, value_positive):
        percent_value_positive = self._percentage_of_total_value_delivered(value_positive)
        percent_value_negative = self._percentage_of_total_value_delivered(value_negative)
        percent_value_non_response = self._percentage_of_total_value_delivered(value_non_response)
        return percent_value_negative, percent_value_non_response, percent_value_positive

    def _get_values(self, raw_stats):
        value_positive = self._get_value(raw_stats.positive_answers)
        value_negative = self._get_value(raw_stats.negative_answers)
        value_non_response = self._get_nodes_total_value(raw_stats.non_response_nodes)
        return value_negative, value_non_response, value_positive

    def _get_count_percentages(self, negative_count, non_response_count, positive_count):
        percent_positive = self._percentage_of_total_deliveries(positive_count)
        percent_negative = self._percentage_of_total_deliveries(negative_count)
        percent_non_response = self._percentage_of_total_deliveries(non_response_count)
        return percent_negative, percent_non_response, percent_positive

    def _get_value(self, answers):
        successful_delivery_runs = answers.values_list('run_id')
        nodes = self.stats_search_data.nodes.filter(run__id__in=successful_delivery_runs)
        return self._get_nodes_total_value(nodes)

    @staticmethod
    def _get_nodes_total_value(queryset):
        return queryset.aggregate(total_value=Sum('total_value'))['total_value'] or 0

    def _percentage_of_total_deliveries(self, quantity):
        total_deliveries = self.total_deliveries()
        percent = Decimal(quantity) / (total_deliveries or 1) * 100
        return round(percent, 1)

    def _percentage_of_total_value_delivered(self, quantity):
        total_delivery_value = self.total_delivery_value()
        percent = Decimal(quantity or 0) / (total_delivery_value or 1) * 100
        return round(percent, 1)
