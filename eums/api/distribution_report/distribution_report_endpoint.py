from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionReport


class DistributionReportSerialiser(serializers.ModelSerializer):
    class Meta:
        model = DistributionReport
        fields = ('consignee', 'programme', 'total_received', 'id', 'total_distributed', 'total_not_received')


class DistributionReportViewSet(ModelViewSet):
    queryset = DistributionReport.objects.all()
    serializer_class = DistributionReportSerialiser


distributionReportRouter = DefaultRouter()
distributionReportRouter.register(r'distribution-report', DistributionReportViewSet)