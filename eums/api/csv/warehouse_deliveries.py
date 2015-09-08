from eums.services.csv_export_service import generate_waybill_csv
from rest_framework.response import Response
from rest_framework.views import APIView


class WarehouseDeliveriesCSV(APIView):

    def get(self, request, *args, **kwargs):
        generate_waybill_csv.apply_async()
        message = {'message': 'Generating CSV, you will be notified via email once it is done.'}
        return Response(message, status=200)