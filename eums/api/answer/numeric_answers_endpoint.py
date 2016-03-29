from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import NumericAnswer
from eums.permissions.numeric_answer_permissions import NumericAnswerPermissions


class NumericAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = NumericAnswer
        fields = ('id', 'question', 'value', 'run', 'remark')


class NumericAnswerViewSet(ModelViewSet):
    permission_classes = (DjangoModelPermissions, NumericAnswerPermissions)
    queryset = NumericAnswer.objects.all().order_by('id')
    serializer_class = NumericAnswerSerializer

    def update(self, request, *args, **kwargs):
        try:
            new_quantity_received = request.data.get('value')
            if (new_quantity_received is None) or (not request.data.get('remark')):
                raise Exception('Empty remark is not allowed while updating numeric-answer')

            previous_answer = NumericAnswer.objects.get(pk=self.kwargs['pk'])
            node = previous_answer.run.runnable

            quantity_shipped = node.quantity_in()
            quantity_distributed = node.acknowledged - node.balance
            if new_quantity_received < quantity_distributed or new_quantity_received > quantity_shipped:
                raise Exception('Quantity received cannot be larger than balance or less than acknowledged count')

            previous_answer.value = new_quantity_received
            previous_answer.remark = request.data.get('remark')
            previous_answer.save()
            return Response(self.get_serializer(previous_answer, many=False).data)
        except Exception as e:
            return Response({"message": e.message}, status=status.HTTP_400_BAD_REQUEST)


numericAnswerRouter = DefaultRouter()
numericAnswerRouter.register(r'numeric-answers', NumericAnswerViewSet)
