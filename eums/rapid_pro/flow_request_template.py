from eums.request.dict_template import DictTemplate


class FlowRequestTemplate(DictTemplate):
    payload = {
        "flow": '${flow}',
        "phone": ['${phone}'],
        "extra": {
            'contactName': '${contact_name}',
            'sender': '${sender}',
            'product': '${item}'
        }
    }
