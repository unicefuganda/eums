from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import Run


class RunSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Run
        fields = ('id', 'scheduled_message_task_id', 'runnable', 'status', 'phone')


class RunViewSet(ModelViewSet):
    queryset = Run.objects.all()
    serializer_class = RunSerialiser


runRouter = DefaultRouter()
runRouter.register(r'run', RunViewSet)