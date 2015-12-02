from django.core.urlresolvers import reverse
from rest_framework.response import Response
from rest_framework.views import APIView
from eums.api.ip_feedback_report.ip_feedback_report_by_delivery_endpoint import filter_delivery_feedback_report
from eums.api.item_feedback_report.item_feedback_report_endpoint import filter_item_feedback_report
from eums.services.csv_export_service import generate_delivery_export_csv, \
    generate_delivery_feedback_report, \
    generate_item_feedback_report


class ExportDeliveryFeedbackReportViewSet(APIView):
    def get(self, request, *args, **kwargs):
        host_name = request.build_absolute_uri(reverse('home'))
        deliveries_feedback = filter_delivery_feedback_report(request)
        generate_delivery_feedback_report.delay(request.user, host_name, deliveries_feedback)
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)
