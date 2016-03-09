import logging
from django.conf import settings

from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from eums.util.contact_client import execute_rapid_pro_contact_update, execute_rapid_pro_contact_delete

logger = logging.getLogger(__name__)


class ContactEndpoint(APIView):
    def post(self, request):
        logger.info(request.data)
        contact = dict(request.data)
        if settings.CELERY_LIVE:
            execute_rapid_pro_contact_update.delay(contact)
        else:
            execute_rapid_pro_contact_update(contact)

        return Response(status=HTTP_200_OK)

    def delete(self, request):
        logger.info(request.data)
        phone = request.GET.get('phone')

        if settings.CELERY_LIVE:
            execute_rapid_pro_contact_delete.delay(phone)
        else:
            execute_rapid_pro_contact_delete(phone)

        return Response(status=HTTP_200_OK)
