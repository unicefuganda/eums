from eums.models import UserProfile
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from eums.models import Programme


@api_view(['GET'])
def programmes_with_ips(request):
    programmes = Programme.objects.all().order_by('name')
    data = map(lambda programme: programme.to_dict_with_ips(), programmes)
    return Response(status=status.HTTP_200_OK, data=data)
