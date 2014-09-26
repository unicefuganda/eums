from inspect import getargspec


class MockCelery():
    def __init__(self):
        self.method = None
        self.invoked_after = None
        self.task_id = None

    def task(self, *args, **_):
        self.method = args[0]
        self.method.apply_async = self.__async_to_sync
        return self.method

    def __async_to_sync(self, *_, **kwargs):
        arg_spec = getargspec(self.method)
        if not len(arg_spec.args):
            self.method()
        else:
            self.invoked_after = kwargs.get('countdown', None)
            method_args = kwargs.get('args', [])
            keyword_args = kwargs.get('kwargs', {})
            self.method(*method_args, **keyword_args)

        task = MockAsyncTask()
        self.task_id = task.id
        return task


class MockAsyncTask():
    def __init__(self):
        self.id = '3ff44672-d7bd-42b2-bf54-b63b9f379546'