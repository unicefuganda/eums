import os
from tempfile import NamedTemporaryFile

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser
from eums.vision.vision_facade import SalesOrderFacade


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_sales_orders(request):
    if 'file' in request.FILES:
        file_contents = request.FILES['file'].file.getvalue()
        temp_file = NamedTemporaryFile(mode='w+b', delete=False, suffix='.xlsx')
        temp_file.write(file_contents)
        temp_file.close()

        sales_order_facade = SalesOrderFacade(temp_file.name)
        sales_order_facade.import_orders()
        os.remove(temp_file.name)

    return HttpResponse(status=200)
