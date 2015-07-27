from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import TextAnswer


class TextAnswerSerialiser(serializers.ModelSerializer):
    class Meta:
        model = TextAnswer
        fields = ('id', 'question', 'value', 'run')


class TextAnswerViewSet(ModelViewSet):
    queryset = TextAnswer.objects.all().order_by('id')
    serializer_class = TextAnswerSerialiser


class DateAnswerViewSet(ModelViewSet):
    queryset = TextAnswer.objects.filter(question__label='dateOfReceipt')
    serializer_class = TextAnswerSerialiser

textAnswerRouter = DefaultRouter()
textAnswerRouter.register(r'text-answers', TextAnswerViewSet)
textAnswerRouter.register(r'date-answers', TextAnswerViewSet)
