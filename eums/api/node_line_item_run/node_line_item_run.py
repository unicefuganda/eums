from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import NodeLineItemRun


class NodeRunSerialiser(serializers.ModelSerializer):
    class Meta:
        model = NodeLineItemRun
        fields = ('id', 'scheduled_message_task_id', 'node', 'status', 'phone')


class NodeRunViewSet(ModelViewSet):
    queryset = NodeLineItemRun.objects.all()
    serializer_class = NodeRunSerialiser


nodeRunRouter = DefaultRouter()
nodeRunRouter.register(r'node-line-item-run', NodeRunViewSet)