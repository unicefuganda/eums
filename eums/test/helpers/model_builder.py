class ModelBuilder(object):
    def __init__(self, target, **options):
        self.instance = target()

        for (key, value) in options.iteritems():
            if hasattr(self.instance, key):
                setattr(self.instance, key, value)
