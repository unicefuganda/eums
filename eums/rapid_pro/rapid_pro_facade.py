import requests
from django.conf import settings
from eums.rapid_pro.fake_endpoints import runs


def start_delivery_run(*_, **kwargs):
    consignee = kwargs['consignee']
    item_description = kwargs['item_description']
    sender = kwargs['sender']
    flow = kwargs['flow']
    payload = {
        "flow": flow,
        "phone": [consignee['phone']],
        "extra": {
            settings.RAPIDPRO_EXTRAS['CONTACT_NAME']: consignee['firstName'] + consignee['lastName'],
            settings.RAPIDPRO_EXTRAS['SENDER']: sender,
            settings.RAPIDPRO_EXTRAS['PRODUCT']: item_description
        }
    }
    headers = {'Authorization': 'Token %s' % settings.RAPIDPRO_API_TOKEN}

    if settings.RAPIDPRO_LIVE:
        requests.post(settings.RAPIDPRO_URLS['RUNS'], data=payload, headers=headers)
    else:
        runs.post(data=payload)