import logging
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_503_SERVICE_UNAVAILABLE
from rest_framework.views import APIView

from eums.services.supply_efficiency_report_service import SupplyEfficiencyReportService

logger = logging.getLogger(__name__)


class SupplyEfficiencyReportEndpoint(APIView):
    def post(self, request):
        try:
            report_items = SupplyEfficiencyReportService.search_reports(request.data)
            return Response(report_items, status=HTTP_200_OK)
        except Exception as e:
            logger.exception("Try to get response from elasticsearch service failed: %s", e)
            return Response({"message": "Service currently not available, please try again later."},
                            status=HTTP_503_SERVICE_UNAVAILABLE)
