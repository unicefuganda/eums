from inspect import getargspec


class MockCelery(object):
    def __init__(self):
        self.method = None
        self.invoked_after = None
        self.task_id = None

    def task(self, *args, **_):
        if args:
            self.method = args[0]
            self.method.apply_async = self.__async_to_sync
            return self.method
        return None

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


class MockPeriodicTask(object):
    args = None

    def __init__(self, run_every=None):
        MockPeriodicTask.args = run_every

    def __call__(self, decorated_function):
        def wrapper(*args):
            decorated_function(*args)
        return wrapper

    @classmethod
    def assert_called_with(cls, method_args):
        return MockPeriodicTask.args == method_args