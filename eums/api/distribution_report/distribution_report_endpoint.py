from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

from eums.models import DistributionReport


class DistributionReportSerialiser(serializers.ModelSerializer):
    class Meta:
        model = DistributionReport
        fields = ('consignee', 'programme', 'total_received_with_quality_issues',
                  'id', 'total_received_with_quantity_issues', 'total_received_without_issues',
                  'total_not_received', 'total_distributed_with_quality_issues',
                  'total_distributed_with_quantity_issues', 'total_distributed_without_issues',
                  'total_not_distributed')


class DistributionReportViewSet(ModelViewSet):
    queryset = DistributionReport.objects.all()
    serializer_class = DistributionReportSerialiser


distributionReportRouter = DefaultRouter()
distributionReportRouter.register(r'distribution-report', DistributionReportViewSet)