from django.core.urlresolvers import reverse
from rest_framework.response import Response
from rest_framework.views import APIView

from eums.services.csv_export_service import generate_supply_efficiency_report
from eums.services.supply_efficiency_report_service import SupplyEfficiencyReportService


class ExportSupplyEfficiencyReportViewSet(APIView):
    def post(self, request):
        host_name = request.build_absolute_uri(reverse('home'))
        report_items = SupplyEfficiencyReportService.search_reports_with_formatted_date(request.data)
        report_type = SupplyEfficiencyReportService.parse_report_type(request.data)
        generate_supply_efficiency_report.delay(request.user, host_name, report_items, report_type)
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)
