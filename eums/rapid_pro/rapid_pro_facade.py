import requests

from eums.settings import RAPIDPRO_URLS, RAPIDPRO_FLOW_ID, RAPIDPRO_EXTRAS


def start_delivery_flow(*_, **kwargs):
    consignee = kwargs['consignee']
    item_description = kwargs['item_description']
    sender = kwargs['sender']
    print "*" * 20, "start delivery flow called with kwargs", consignee, item_description, sender, "*" * 20
    payload = {
        "flow": RAPIDPRO_FLOW_ID,
        "phone": [consignee['phone']],
        "extra": {
            RAPIDPRO_EXTRAS['CONTACT_NAME']: consignee['first_name'] + consignee['last_name'],
            RAPIDPRO_EXTRAS['SENDER']: sender,
            RAPIDPRO_EXTRAS['PRODUCT']: item_description
        }
    }
    print "*" * 20, "rapid pro settings in start delivery flow", "*" * 20
    print "*" * 20, "runs url = ", RAPIDPRO_URLS['RUNS'], "*" * 20
    print "*" * 20, "@extra.contactName = ", RAPIDPRO_EXTRAS['CONTACT_NAME'], "*" * 20
    print "*" * 20, "@extra.sender = ", RAPIDPRO_EXTRAS['SENDER'], "*" * 20
    print "*" * 20, "@extra.product = ", RAPIDPRO_EXTRAS['PRODUCT'], "*" * 20
    requests.post(RAPIDPRO_URLS['RUNS'], data=payload)