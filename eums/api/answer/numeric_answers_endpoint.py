from rest_framework import serializers
from rest_framework import status
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

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
            if (request.data.get('value') is None) or (not request.data.get('remark')):
                raise Exception('empty remark is not allowed while updating numeric-answer')
            previous_answer = NumericAnswer.objects.get(pk=self.kwargs['pk'])
            previous_answer.value = request.data.get('value')
            previous_answer.remark = request.data.get('remark')
            previous_answer.save()
            return Response(self.get_serializer(previous_answer, many=False).data)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


numericAnswerRouter = DefaultRouter()
numericAnswerRouter.register(r'numeric-answers', NumericAnswerViewSet)
