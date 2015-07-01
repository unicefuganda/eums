from rest_framework import filters
from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionPlanNode


class DistributionPlanNodeSerialiser(serializers.ModelSerializer):
    children = serializers.PrimaryKeyRelatedField(read_only=True, many=True)

    class Meta:
        model = DistributionPlanNode
        fields = ('id', 'parent', 'distribution_plan', 'children', 'location', 'consignee', 'tree_position',
                  'contact_person_id', 'item', 'targeted_quantity', 'planned_distribution_date', 'remark', 'track')


class DistributionPlanNodeViewSet(ModelViewSet):
    queryset = DistributionPlanNode.objects.all()
    serializer_class = DistributionPlanNodeSerialiser
    filter_backends = (filters.DjangoFilterBackend,)
    search_fields = ('tree_position',)
    filter_fields = ('consignee', 'item', 'distribution_plan', 'parent')

distributionPlanNodeRouter = DefaultRouter()
distributionPlanNodeRouter.register(r'distribution-plan-node', DistributionPlanNodeViewSet)
