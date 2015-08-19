from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class AlertResponses(APIView):
    def get(self, request, *args, **kwargs):
        result = [{'waybill': 72082647, 'issue': 'Not Received'}, {'waybill': 12345678, 'issue': 'Bad Condition'}]
        return Response(result, status=status.HTTP_200_OK)