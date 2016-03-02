from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from eums.models import SystemSettings


@csrf_exempt
def login_data(request):
    if request.method == "GET":
        country_name = SystemSettings.objects.all().first().country_label
        return JsonResponse({'country_name': country_name})
    else:
        return JsonResponse({'error': 'request error'})