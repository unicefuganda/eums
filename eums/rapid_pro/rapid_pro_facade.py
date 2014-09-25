import requests

from eums.settings import RAPIDPRO_URLS, RAPIDPRO_FLOW_ID


def start_delivery_flow(*_, **kwargs):
    consignee = kwargs['consignee']
    item_description = kwargs['item_description']
    payload = {
        "flow": RAPIDPRO_FLOW_ID,
        "phone": [consignee['phone']],
        "extra": {
            "contactName": consignee['first_name'] + consignee['last_name'],
            "implementingPartner": "Save the children",
            "product": item_description
        }
    }
    requests.post(RAPIDPRO_URLS['RUNS'], data=payload)