import re

HANDLER_KEY = '__handler__'
HANDLER_VALUE = '__value__'


class DictTemplate(object):
    payload = {}

    def build(self, **options):
        return self.__build_nested_dict(options, self.payload.copy())

    def __build_nested_dict(self, options, payload):
        if type(payload) is str:
            return self.__replace(payload, options)
        if type(payload) is list:
            return [self.__build_nested_dict(options, item) for item in payload]
        if type(payload) is dict:
            if HANDLER_KEY in payload:
                return payload[HANDLER_KEY](self.__replace(payload[HANDLER_VALUE], options))
            else:
                return {key: self.__build_nested_dict(options, value) for key, value in payload.iteritems()}
        return payload

    def __replace(self, value, options):
        matches = re.search('\${([^}]*)}', value)
        if matches is None:
            return value

        search = re.search('^\${([^}]*)}$', value)
        if search:
            return options[list(search.groups()).pop()]

        generated_value = value
        for replacement in matches.groups([]):
            generated_value = generated_value.replace('${%s}' % replacement, str(options[replacement]))

        return generated_value
