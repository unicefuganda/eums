from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from eums.models import UserProfile


@api_view(['GET',])
def ip_feedback_report(request):
    logged_in_user = request.user

    try:
        user_profile = UserProfile.objects.get(user=logged_in_user)
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    except:
        return Response(status=status.HTTP_200_OK)
