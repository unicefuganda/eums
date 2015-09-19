from decimal import Decimal
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView
from eums.models import DistributionPlanNode as DeliveryNode, MultipleChoiceQuestion, Flow, Runnable, Option, \
    MultipleChoiceAnswer, Run


class DistrictStats(APIView):
    def __init__(self):
        super(DistrictStats, self).__init__()
        self.end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
        self.was_product_received = MultipleChoiceQuestion.objects.get(label='productReceived', flow=self.end_user_flow)
        self.product_was_received = Option.objects.get(text='Yes', question=self.was_product_received)

    def number_of_successful_deliveries(self):
        number_of_successful_product_deliveries = MultipleChoiceAnswer.objects.filter(
            question=self.was_product_received,
            value=self.product_was_received).filter(
            Q(run__status=Run.STATUS.scheduled) | Q(run__status=Run.STATUS.completed)
        ).count()
        return number_of_successful_product_deliveries

    def percent_successful_deliveries(self):
        successful_deliveries = self.number_of_successful_deliveries()
        total_deliveries = Run.objects.filter(
            Q(status=Run.STATUS.scheduled) | Q(status=Run.STATUS.completed),
            runnable__track=True).count()
        percent = Decimal(successful_deliveries) / total_deliveries * 100
        return round(percent, 1)

    def get(self, request, *args, **kwargs):
        consignee_type = request.GET.get('consigneeType', DeliveryNode.END_USER)

        if consignee_type == DeliveryNode.END_USER:
            return Response({
                'numberOfSuccessfulProductDeliveries': self.number_of_successful_deliveries(),
                'percentageOfSuccessfulDeliveries': self.percent_successful_deliveries()
            })
