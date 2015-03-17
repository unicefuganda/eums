from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Question


class QuestionSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'text', 'label')


class QuestionViewSet(ModelViewSet):
    queryset = Question.objects.all().order_by('text')
    serializer_class = QuestionSerialiser
    filter_backends = (filters.SearchFilter,)
    search_fields = ('label',)


questionRouter = DefaultRouter()
questionRouter.register(r'question', QuestionViewSet)

