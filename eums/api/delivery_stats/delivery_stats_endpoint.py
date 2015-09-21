from decimal import Decimal

from django.db.models import Sum
from rest_framework.response import Response

from rest_framework.views import APIView
from eums.api.delivery_stats.quality_of_product_stats import get_quality_of_product_base_query_sets
from eums.api.delivery_stats.satisfied_with_product_stats import get_satisfied_with_product_base_query_sets

from eums.api.delivery_stats.stats_structure import DeliveryStats, BaseQuerySets
from eums.api.delivery_stats.was_product_received_stats import get_product_received_base_query_sets
from eums.models import DistributionPlanNode as DeliveryNode, Flow, Runnable


class DeliveryStatsEndpoint(APIView):
    def __init__(self):
        self.end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
        self.end_user_nodes = DeliveryNode.objects.filter(tree_position=DeliveryNode.END_USER, track=True)
        self.location = None
        super(DeliveryStatsEndpoint, self).__init__()

    def get(self, request, *args, **kwargs):
        consignee_type = request.GET.get('consigneeType', DeliveryNode.END_USER)
        self.location = request.GET.get('location')

        if self.location:
            self.end_user_nodes = self.end_user_nodes.filter(location=self.location)

        product_received_stats = self._get_product_received_stats()
        quality_of_product_stats = self._get_quality_of_product_stats()
        satisfied_with_product_stats = self._get_satisfied_with_product_stats()

        if consignee_type == DeliveryNode.END_USER:
            return Response({
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
            })

    def total_deliveries(self):
        return self.end_user_nodes.count()

    def total_delivery_value(self):
        return self._get_nodes_total_value(self.end_user_nodes)

    def _get_product_received_stats(self):
        base_query_sets = get_product_received_base_query_sets()
        filtered_query_sets = self._apply_filters(base_query_sets)
        return self._get_question_stats(filtered_query_sets)

    def _get_quality_of_product_stats(self):
        base_query_sets = get_quality_of_product_base_query_sets()
        filtered_query_sets = self._apply_filters(base_query_sets)
        return self._get_question_stats(filtered_query_sets)

    def _get_satisfied_with_product_stats(self):
        base_query_sets = get_satisfied_with_product_base_query_sets()
        filtered_query_sets = self._apply_filters(base_query_sets)
        return self._get_question_stats(filtered_query_sets)

    def _apply_filters(self, base_query_sets):
        filtered_positive_answers = base_query_sets.positive_answers
        if self.location:
            filtered_positive_answers = base_query_sets.positive_answers.filter(run__runnable__location=self.location)
        return BaseQuerySets(
            filtered_positive_answers,
            base_query_sets.negative_answers,
            base_query_sets.runs_with_answers
        )

    def _get_question_stats(self, raw_stats):
        positive_count = raw_stats.positive_answers.count()
        non_response_count = self.end_user_nodes.exclude(run__id__in=raw_stats.runs_with_answers).distinct().count()
        negative_count = self.total_deliveries() - positive_count - non_response_count

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
        value_positive = self._get_value(raw_stats.positive_answers) or 0
        value_negative = self._get_value(raw_stats.negative_answers) or 0
        value_non_response = self.total_delivery_value() - value_positive - value_negative
        return value_negative, value_non_response, value_positive

    def _get_count_percentages(self, negative_count, non_response_count, positive_count):
        percent_positive = self._percentage_of_total_deliveries(positive_count)
        percent_negative = self._percentage_of_total_deliveries(negative_count)
        percent_non_response = self._percentage_of_total_deliveries(non_response_count)
        return percent_negative, percent_non_response, percent_positive

    def _get_value(self, answers):
        successful_delivery_runs = answers.values_list('run_id')
        nodes = self.end_user_nodes.filter(run__id__in=successful_delivery_runs)
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
