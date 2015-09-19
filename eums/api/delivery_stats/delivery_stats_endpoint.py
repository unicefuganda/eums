from rest_framework.response import Response

from rest_framework.views import APIView

from eums.api.delivery_stats.was_product_received import WasProductReceivedStatsMixin
from eums.models import DistributionPlanNode as DeliveryNode, Flow, Runnable


class DeliveryStatsEndpoint(WasProductReceivedStatsMixin, APIView):
    def __init__(self):
        self.end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
        self.end_user_nodes = DeliveryNode.objects.filter(tree_position=DeliveryNode.END_USER, track=True)
        super(DeliveryStatsEndpoint, self).__init__()

    def get(self, request, *args, **kwargs):
        consignee_type = request.GET.get('consigneeType', DeliveryNode.END_USER)

        if consignee_type == DeliveryNode.END_USER:
            return Response({
                'totalNumberOfDeliveries': self.total_deliveries(),
                'numberOfSuccessfulProductDeliveries': self.number_of_successful_deliveries(),
                'percentageOfSuccessfulDeliveries': self.percent_successful_deliveries(),
                'numberOfUnsuccessfulProductDeliveries': self.number_of_unsuccessful_deliveries(),
                'percentageOfUnsuccessfulDeliveries': self.percent_unsuccessful_deliveries(),
                'numberOfNonResponseToProductReceived': self.number_of_non_response_deliveries(),
                'percentageOfNonResponseToProductReceived': self.percent_non_response_deliveries(),
                'totalValueOfDeliveries': self.total_delivery_value(),
                'totalValueOfSuccessfulDeliveries': self.total_successful_delivery_value(),
                'percentageValueOfSuccessfulDeliveries': self.percentage_value_of_successful_deliveries(),
                'totalValueOfUnsuccessfulProductDeliveries': self.total_unsuccessful_delivery_value(),
                'percentageValueOfUnsuccessfulDeliveries': self.percentage_value_of_unsuccessful_deliveries(),
                'totalValueOfNonResponseToProductReceived': self.total_value_of_non_response_deliveries(),
                'percentageValueOfNonResponseToProductReceived': self.percentage_value_of_non_response_deliveries(),
            })
