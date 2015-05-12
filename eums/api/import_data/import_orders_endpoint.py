import os
from tempfile import NamedTemporaryFile

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser

from eums.vision.vision_facade import SalesOrderFacade, ReleaseOrderFacade, PurchaseOrderFacade


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_sales_orders(request):
    return _import_orders(request, SalesOrderFacade)


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_release_orders(request):
    return _import_orders(request, ReleaseOrderFacade)


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_purchase_orders(request):
    return _import_orders(request, PurchaseOrderFacade)


def _import_orders(request, order_facade):
    if 'file' in request.FILES:
        file_contents = request.FILES['file'].file.getvalue()
        temp_file = NamedTemporaryFile(mode='w+b', delete=False, suffix='.xlsx')
        temp_file.write(file_contents)
        temp_file.close()

        order_facade = order_facade(temp_file.name)
        order_facade.import_orders()
        os.remove(temp_file.name)

    return HttpResponse(status=200)