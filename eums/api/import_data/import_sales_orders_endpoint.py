from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def import_sales_orders(request):
    params = request.POST
    print params
    return HttpResponse(status=200)
