from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import TextAnswer


class TextAnswerSerialiser(serializers.ModelSerializer):
    class Meta:
        model = TextAnswer
        fields = ('value', 'question')


class TextAnswerViewSet(ModelViewSet):
    queryset = TextAnswer.objects.filter(question__label='dateOfReceipt')
    serializer_class = TextAnswerSerialiser


textAnswerRouter = DefaultRouter()
textAnswerRouter.register(r'date-answers', TextAnswerViewSet)
