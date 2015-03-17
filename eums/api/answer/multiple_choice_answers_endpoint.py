from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import MultipleChoiceAnswer


class MultipleChoiceAnswerSerialiser(serializers.ModelSerializer):
    class Meta:
        model = MultipleChoiceAnswer
        fields = ('id', 'question', 'value', 'line_item_run')


class MultipleChoiceAnswerViewSet(ModelViewSet):
    queryset = MultipleChoiceAnswer.objects.all().order_by('id')
    serializer_class = MultipleChoiceAnswerSerialiser

multipleChoiceAnswerRouter = DefaultRouter()
multipleChoiceAnswerRouter.register(r'multiple-choice-answers', MultipleChoiceAnswerViewSet)
