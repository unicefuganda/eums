from decimal import Decimal

from django.db.models import Sum
from rest_framework.response import Response

from rest_framework.views import APIView

from eums.api.delivery_stats.quality_of_product_stats import QualityOfProductMixin
from eums.api.delivery_stats.stats_structure import DeliveryStats
from eums.api.delivery_stats.was_product_received_stats import get_product_received_basic_values
from eums.models import DistributionPlanNode as DeliveryNode, Flow, Runnable


class DeliveryStatsEndpoint(QualityOfProductMixin, APIView):
    def __init__(self):
        self.end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
        self.end_user_nodes = DeliveryNode.objects.filter(tree_position=DeliveryNode.END_USER, track=True)
        super(DeliveryStatsEndpoint, self).__init__()

    def get(self, request, *args, **kwargs):
        consignee_type = request.GET.get('consigneeType', DeliveryNode.END_USER)
        product_received_stats = self._get_product_received_stats()

        if consignee_type == DeliveryNode.END_USER:
            return Response({
                'totalNumberOfDeliveries': self.total_deliveries(),
                'numberOfSuccessfulProductDeliveries': product_received_stats.count_positive,
                'numberOfUnsuccessfulProductDeliveries': product_received_stats.count_negative,
                'numberOfNonResponseToProductReceived': product_received_stats.count_non_response,

                'percentageOfSuccessfulDeliveries': product_received_stats.percent_positive,
                'percentageOfUnsuccessfulDeliveries': product_received_stats.percent_negative,
                'percentageOfNonResponseToProductReceived': product_received_stats.percent_non_response,

                'totalValueOfDeliveries': self.total_delivery_value(),
                'totalValueOfSuccessfulDeliveries': product_received_stats.value_positive,
                'totalValueOfUnsuccessfulProductDeliveries': product_received_stats.value_negative,
                'totalValueOfNonResponseToProductReceived': product_received_stats.value_non_response,

                'percentageValueOfSuccessfulDeliveries': product_received_stats.percent_value_positive,
                'percentageValueOfUnsuccessfulDeliveries': product_received_stats.percent_value_negative,
                'percentageValueOfNonResponseToProductReceived': product_received_stats.percent_value_non_response,

                'numberOfDeliveriesInGoodOrder': self.number_of_deliveries_in_good_order()
            })

    def total_deliveries(self):
        return self.end_user_nodes.count()

    def total_delivery_value(self):
        return self._get_nodes_total_value(self.end_user_nodes)

    @staticmethod
    def _get_nodes_total_value(queryset):
        return queryset.aggregate(total_value=Sum('total_value'))['total_value']

    def _percentage_of_total_deliveries(self, quantity):
        total_deliveries = self.total_deliveries()
        percent = Decimal(quantity) / total_deliveries * 100
        return round(percent, 1)

    def _percentage_of_total_value_delivered(self, quantity):
        total_delivery_value = self.total_delivery_value()
        percent = Decimal(quantity or 0) / total_delivery_value * 100
        return round(percent, 1)

    def _get_product_received_stats(self):
        raw_stats = get_product_received_basic_values()
        positive_count = raw_stats.positive_answers.count()
        non_response_count = self.end_user_nodes.exclude(run__id__in=raw_stats.runs_with_answers).distinct().count()
        negative_count = self.total_deliveries() - positive_count - non_response_count

        percent_positive = self._percentage_of_total_deliveries(positive_count)
        percent_negative = self._percentage_of_total_deliveries(negative_count)
        percent_non_response = self._percentage_of_total_deliveries(non_response_count)

        value_positive = self._get_value(raw_stats.positive_answers) or 0
        value_negative = self._get_value(raw_stats.negative_answers) or 0
        value_non_response = self.total_delivery_value() - value_positive - value_negative

        percent_value_positive = self._percentage_of_total_value_delivered(value_positive)
        percent_value_negative = self._percentage_of_total_value_delivered(value_negative)
        percent_value_non_response = self._percentage_of_total_value_delivered(value_non_response)

        return DeliveryStats(positive_count, negative_count, non_response_count,
                             percent_positive, percent_negative, percent_non_response,
                             value_positive, value_negative, value_non_response,
                             percent_value_positive, percent_value_negative, percent_value_non_response)

    def _get_value(self, answers):
        successful_delivery_runs = answers.values_list('run_id')
        nodes = self.end_user_nodes.filter(run__id__in=successful_delivery_runs)
        return self._get_nodes_total_value(nodes)
