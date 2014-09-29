import requests
from django.conf import settings

from eums.rapid_pro import fake_rapid_pro


def start_delivery_run(*_, **kwargs):
    print "*" * 20, "IN start delivery run method", "*" * 20
    consignee = kwargs['consignee']
    item_description = kwargs['item_description']
    sender = kwargs['sender']
    print "*" * 20, "Consignee", consignee, "*" * 20
    print "*" * 20, "Item ", item_description, "*" * 20
    print "*" * 20, "sender ", sender, "*" * 20
    payload = {
        "flow": settings.RAPIDPRO_FLOW_ID,
        "phone": [consignee['phone']],
        "extra": {
            settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: consignee['first_name'] + consignee['last_name'],
            settings.RAPIDPRO_EXTRAS['SENDER']: sender,
            settings.RAPIDPRO_EXTRAS['PRODUCT']: item_description
        }
    }
    print "*" * 20, "Payload ", payload, "*" * 20
    headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN}
    print '*' * 20, 'EXPECTED HEADER', headers, '*' * 20
    print '*' * 20, 'URLS', settings.RAPIDPRO_URLS['RUNS'], '*' * 20

    if settings.RAPIDPRO_LIVE:
        requests.post(settings.RAPIDPRO_URLS['RUNS'], data=payload, headers=headers)
    else:
        fake_rapid_pro.runs.post(data=payload)