from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import NodeLineItemRun


class NodeLineItemRunSerialiser(serializers.ModelSerializer):
    class Meta:
        model = NodeLineItemRun
        fields = ('id', 'scheduled_message_task_id', 'node_line_item', 'status', 'phone')


class NodeLineItemRunViewSet(ModelViewSet):
    queryset = NodeLineItemRun.objects.all()
    serializer_class = NodeLineItemRunSerialiser


nodeLineItemRunRouter = DefaultRouter()
nodeLineItemRunRouter.register(r'node-line-item-run', NodeLineItemRunViewSet)