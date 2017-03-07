from eums.request.dict_template import DictTemplate


class FlowRequestTemplate(DictTemplate):
    payload = {
        "flow": '${flow}',
        "phone": ['${phone}'],
        "contacts": ['${contact_id}'],
        "extra": {
            'contactName': '${contact_name}',
            'sender': '${sender}',
            'product': '${item}'
        }
    }
