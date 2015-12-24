from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def current_user(request):
    data = {}
    data['userid'] =  request.user.id
    data['username'] =  request.user.username
    data['first_name'] = request.user.first_name
    data['last_name'] = request.user.last_name
    data['email'] = request.user.email
    try:
        data['consignee_id'] = request.user.user_profile.consignee_id
    except:
        data['consignee_id'] = None
    return JsonResponse(data)
