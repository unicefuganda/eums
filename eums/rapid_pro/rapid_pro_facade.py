import requests
from django.conf import settings

from eums.rapid_pro import fake_rapid_pro


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
    print "*" * 20, "[In facade] Rapid pro live = ", settings.RAPIDPRO_LIVE, "*" * 20

    if settings.RAPIDPRO_LIVE:
        requests.post(settings.RAPIDPRO_URLS['RUNS'], data=payload, headers=headers)
    else:
        fake_rapid_pro.runs.post(data=payload)