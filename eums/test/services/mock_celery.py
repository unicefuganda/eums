from inspect import getargspec


class MockCelery():
    def __init__(self):
        self.method = None

    def task(self, *args, **_):
        self.method = args[0]
        self.method.apply_async = self.__async_to_sync
        return self.method

    def __async_to_sync(self, *_, **kwargs):
        arg_spec = getargspec(self.method)
        if not len(arg_spec.args):
            self.method()
        else:
            method_args = kwargs.get('args', [])
            keyword_args = kwargs.get('kwargs', {})
            self.method(*method_args, **keyword_args)