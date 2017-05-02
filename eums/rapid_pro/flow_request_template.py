from eums.request.dict_template import DictTemplate


class FlowRequestTemplate(DictTemplate):
    payload = {
        "flow": '${flow}',
        "urns": ['tel:${phone}'],
        "extra": {
            'contactName': '${contact_name}',
            'sender': '${sender}',
            'product': '${item}'
        }
    }
