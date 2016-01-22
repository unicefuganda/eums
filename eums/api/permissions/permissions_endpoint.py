from django.http.response import HttpResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.status import HTTP_403_FORBIDDEN, HTTP_200_OK


@csrf_exempt
def check_user_permission(request):
    try:
        permission = request.GET['permission']
        return HttpResponse(status=HTTP_200_OK if request.user.has_perm(permission) else HTTP_403_FORBIDDEN)
    except StandardError:
        return HttpResponse(status=HTTP_403_FORBIDDEN)


@csrf_exempt
@api_view(['GET', ])
def retrieve_user_permissions(request):
    permissions = request.user.get_all_permissions()
    return Response(list(permissions), status=HTTP_200_OK)
