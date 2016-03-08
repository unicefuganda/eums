from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView

from eums.services.alert_service import get_queryset
from eums.services.csv_export_service import generate_alert_export_csv


class ExportAlertViewSet(APIView):

    def get(self, request, *args, **kwargs):
        host_name = request.build_absolute_uri(reverse('home'))
        alert_type = request.GET.get('type', None)
        po_waybill = request.GET.get('po_waybill', None)

        alerts = get_queryset(alert_type, po_waybill)
        generate_alert_export_csv.delay(request.user, host_name, alerts, alert_type)
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)
