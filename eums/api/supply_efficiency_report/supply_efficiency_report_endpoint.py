import logging
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from eums.services.supply_efficiency_report_service import SupplyEfficiencyReportService

logger = logging.getLogger(__name__)


class SupplyEfficiencyReportEndpoint(APIView):
    def post(self, request):
        report_items = SupplyEfficiencyReportService.search_reports(request.data)
        return Response(report_items, status=HTTP_200_OK)
