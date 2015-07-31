from tempfile import NamedTemporaryFile

from django.contrib.auth.decorators import permission_required
from django.core.exceptions import PermissionDenied
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser
from eums.vision.vision_facade import SalesOrderFacade, ReleaseOrderFacade, PurchaseOrderFacade, ConsigneeFacade, \
    ProgrammeFacade


@csrf_exempt
@parser_classes((MultiPartParser,))
@permission_required('auth.can_import_data',
                     raise_exception=PermissionDenied())
def import_sales_orders(request):
    return _import_records(request, SalesOrderFacade)


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_release_orders(request):
    return _import_records(request, ReleaseOrderFacade)


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_purchase_orders(request):
    return _import_records(request, PurchaseOrderFacade)


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_consignees(request):
    return _import_records(request, ConsigneeFacade)


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_programmes(request):
    return _import_records(request, ProgrammeFacade)


def _import_records(request, facade):
    if 'file' in request.FILES:
        try:
            file_contents = request.FILES['file'].file.getvalue()
            temp_file = NamedTemporaryFile(mode='w+b', delete=False, suffix='.xlsx')
            temp_file.write(file_contents)
            temp_file.close()

            facade = facade(temp_file.name)
            facade.import_records()
            os.remove(temp_file.name)
            return JsonResponse({'error': ''})
        except Exception, e:
            return JsonResponse({'error': e.message})
    else:
        return JsonResponse({'error': 'File data not supplied'})
