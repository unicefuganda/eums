from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import NumericAnswer


class NumericAnswerSerialiser(serializers.ModelSerializer):
    class Meta:
        model = NumericAnswer
        fields = ('id', 'question', 'value', 'run')


class NumericAnswerViewSet(ModelViewSet):
    queryset = NumericAnswer.objects.all().order_by('id')
    serializer_class = NumericAnswerSerialiser

numericAnswerRouter = DefaultRouter()
numericAnswerRouter.register(r'numeric-answers', NumericAnswerViewSet)
