import requests

from django.conf import settings


def start_delivery_run(*_, **kwargs):
    consignee = kwargs['consignee']
    item_description = kwargs['item_description']
    sender = kwargs['sender']
    payload = {
        "flow": settings.RAPIDPRO_FLOW_ID,
        "phone": [consignee['phone']],
        "extra": {
            settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: consignee['first_name'] + consignee['last_name'],
            settings.RAPIDPRO_EXTRAS['SENDER']: sender,
            settings.RAPIDPRO_EXTRAS['PRODUCT']: item_description
        }
    }
    headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN}
    print '*' * 20, 'EXPECTED HEADER', headers, '*' * 20
    print '*' * 20, 'URLS', settings.RAPIDPRO_URLS['RUNS'], '*' * 20
    requests.post(settings.RAPIDPRO_URLS['RUNS'], data=payload, headers=headers)