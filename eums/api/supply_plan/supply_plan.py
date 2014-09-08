from rest_framework.routers import DefaultRouter
from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework.viewsets import ModelViewSet
from eums.models import SupplyPlan


class SupplyPlanSerialiser(HyperlinkedModelSerializer):
    class Meta:
        model = SupplyPlan
        fields = ('id', 'program_name')


class SupplyPlanViewSet(ModelViewSet):
    queryset = SupplyPlan.objects.all()
    serializer_class = SupplyPlanSerialiser


supplyPlanRouter = DefaultRouter()
supplyPlanRouter.register(r'supply-plan', SupplyPlanViewSet)
