import logging

from django.conf import settings
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from eums.services.contact_service import execute_rapid_pro_contact_update, execute_rapid_pro_contact_delete, \
    ContactService

logger = logging.getLogger(__name__)


class ContactEndpoint(APIView):
    def get(self, request):
        searchfield = request.GET.get('searchfield')
        if searchfield:
            return Response(status=HTTP_200_OK, data=ContactService.search(searchfield))
        return Response(status=HTTP_200_OK, data=ContactService.get_all())

    def delete(self, request, pk):
        logger.info(request.data)

        current_contact = ContactService.get(pk)
        response_code = ContactService.delete(pk)
        ContactEndpoint.__delete_rapid_pro_contact(current_contact.get('phone'))

        return Response(status=response_code)

    def post(self, request):
        logger.info(request.data)

        response_code = ContactService.add(request.data)

        ContactEndpoint.__add_or_update_rapid_pro_contact(request.data)

        return Response(status=response_code)

    def put(self, request):
        response_code = ContactService.update(request.data)

        ContactEndpoint.__add_or_update_rapid_pro_contact(request.data)

        return Response(status=response_code)

    @staticmethod
    def __add_or_update_rapid_pro_contact(request_body):
        contact = dict(request_body)
        if settings.CELERY_LIVE:
            execute_rapid_pro_contact_update.delay(contact)
        else:
            execute_rapid_pro_contact_update(contact)

    @staticmethod
    def __delete_rapid_pro_contact(phone):
        if settings.CELERY_LIVE:
            execute_rapid_pro_contact_delete.delay(phone)
        else:
            execute_rapid_pro_contact_delete(phone)
