import requests

from eums.settings import RAPIDPRO_URLS, RAPIDPRO_FLOW_ID, RAPIDPRO_EXTRAS


def start_delivery_flow(*_, **kwargs):
    consignee = kwargs['consignee']
    item_description = kwargs['item_description']
    payload = {
        "flow": RAPIDPRO_FLOW_ID,
        "phone": [consignee['phone']],
        "extra": {
            RAPIDPRO_EXTRAS['CONTACT_NAME']: consignee['first_name'] + consignee['last_name'],
            RAPIDPRO_EXTRAS['SENDER']: "Save the children",
            RAPIDPRO_EXTRAS['PRODUCT']: item_description
        }
    }
    requests.post(RAPIDPRO_URLS['RUNS'], data=payload)