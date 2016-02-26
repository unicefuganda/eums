from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from eums.auth import GROUP_UNICEF_ADMIN


@csrf_exempt
def current_user(request):
    user_profile = getattr(request.user, 'user_profile', None)
    try:
        group = request.user.groups.values_list('name')[0][0]
    except IndexError:
        group = GROUP_UNICEF_ADMIN

    data = {
        'userid': request.user.id,
        'username': request.user.username,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'email': request.user.email,
        'group': group,
        'consignee_id': request.user.user_profile.consignee_id if user_profile else None
    }
    return JsonResponse(data)
