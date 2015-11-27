from django.core.urlresolvers import reverse
from eums.services.csv_export_service import generate_delivery_export_csv
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet


class ExportDeliveryViewSet(APIView):
    def get(self, request, *args, **kwargs):
        host_name = request.build_absolute_uri(reverse('home'))
        export_type = request.GET.get('type')
        generate_delivery_export_csv.delay(request.user, export_type, host_name)
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)
