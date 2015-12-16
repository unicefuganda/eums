from django.core.urlresolvers import reverse
from rest_framework.response import Response
from rest_framework.views import APIView
from eums.api.stock_report.stock_report_endpoint import filter_stock_feedback_report
from eums.services.csv_export_service import generate_delivery_export_csv, \
    generate_delivery_feedback_report, \
    generate_stock_feedback_report


class ExportStockFeedbackReportViewSet(APIView):
    def get(self, request, *args, **kwargs):
        host_name = request.build_absolute_uri(reverse('home'))
        stocks_feedback = filter_stock_feedback_report(request)
        generate_stock_feedback_report.delay(request.user, host_name, stocks_feedback)
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)
