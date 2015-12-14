import datetime

ONE_HOUR = 3600


class InMemoryCache(object):
    def __init__(self):
        self.caching = {}
        self.last_sync_time = None

    @property
    def expired(self):
        return self.last_sync_time is None or (datetime.datetime.now() - self.last_sync_time).seconds > ONE_HOUR

    def invalidate(self):
        self.caching = {}
        self.last_sync_time = None

    def update(self, **kwargs):
        self.caching = kwargs
        for key, value in self.caching.iteritems():
            setattr(self, key, value)
        self.last_sync_time = datetime.datetime.now()

    def __getattr__(self, item):
        if item in self.caching:
            return self.caching[item]
        return None
