import os
from tempfile import NamedTemporaryFile
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser
from xlutils.view import View
from eums.vision.vision_facade import SalesOrderFacade


@csrf_exempt
@parser_classes((MultiPartParser,))
def import_sales_orders(request):
    file_contents = request.FILES['file'].file.getvalue()
    temp_file = NamedTemporaryFile(mode='w+b', delete=True)
    temp_file.write(file_contents)
    abs_path = os.path.abspath(temp_file.name)

    print abs_path
    view = View(abs_path)
    print view[0][1:, :]

    # sales_order_facade = SalesOrderFacade(temp_file.name)
    # print sales_order_facade.load_order_data()
    temp_file.close()
    return HttpResponse(status=200)
