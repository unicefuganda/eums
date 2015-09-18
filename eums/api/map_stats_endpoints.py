from rest_framework.response import Response
from rest_framework.views import APIView
from eums.models import DistributionPlanNode as DeliveryNode, MultipleChoiceQuestion, Flow, Runnable, Option, \
    MultipleChoiceAnswer


class DistrictStats(APIView):
    def get(self, request, *args, **kwargs):
        end_user_flow = Flow.objects.get(for_runnable_type=Runnable.END_USER)
        was_product_received = MultipleChoiceQuestion.objects.get(label='productReceived', flow=end_user_flow)
        product_was_received = Option.objects.get(text='Yes', question=was_product_received)
        consignee_type = request.GET.get('consigneeType', DeliveryNode.END_USER)

        if consignee_type == DeliveryNode.END_USER:
            number_of_successful_product_deliveries = MultipleChoiceAnswer.objects.filter(
                question=was_product_received, value=product_was_received).count()
            return Response({'numberOfSuccessfulProductDeliveries': number_of_successful_product_deliveries})
