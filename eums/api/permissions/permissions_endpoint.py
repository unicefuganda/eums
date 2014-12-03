from django.http.response import HttpResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def check_user_permission(request):
    try:
        permission = request.GET['permission']
        if request.user.has_perm(permission):
            return HttpResponse(status=200)
        return HttpResponse(status=401)
    except StandardError:
        return HttpResponse(status=401)
