from eums.request.dict_template import DictTemplate


class FlowRequestTemplate(DictTemplate):
    payload = {
        "flow": {
            '__handler__': lambda flow_id: int(flow_id),
            '__value__': '${flow}'
        },
        "phone": ['${phone}'],
        "extra": {
            'contactName': '${contact_name}',
            'sender': '${sender}',
            'product': '${item}'
        }
    }
