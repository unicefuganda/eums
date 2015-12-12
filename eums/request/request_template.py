import re


class FlowRequestTemplate(object):
    payload = {
        "flow": {
            'handler': lambda flow_id: int(flow_id),
            'value': '${flow_id}'
        },
        "phone": ['${phone}'],
        "extra": {
            'contactName': '${contact_name}',
            'sender': '${sender}',
            'product': '${item}'
        }
    }

    def build(self, **options):
        payload = self.payload.copy()

        self.__perform_build(options, payload)

        return payload

    def __replace(self, value, options):
        matches = re.search('\${([^}]*)}', value)
        if matches is None: return value

        generated_value = value
        for replacement in matches.groups([]):
            generated_value = generated_value.replace('${%s}' % replacement, options[replacement])

        return generated_value

    def __perform_build(self, options, payload):

        for key, value in payload.iteritems():
            if type(value) is str:
                payload[key] = self.__replace(value, options)

            if type(value) is dict:
                self.__perform_build(options, payload[key])

            if type(value) is list:
                payload[key] = [
                    self.__replace(item, options) if type(item) is str else self.__perform_build(options, item) for item
                    in value]
