from django.http.response import HttpResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import status


@csrf_exempt
def check_user_permission(request):
    try:
        permission = request.GET['permission']
        return HttpResponse(status=200 if request.user.has_perm(permission) else 401)
    except StandardError:
        return HttpResponse(status=401)


@csrf_exempt
@api_view(['GET', ])
def retrieve_user_permissions(request):
    permissions = request.user.get_all_permissions()
    return Response(list(permissions), status=status.HTTP_200_OK)
