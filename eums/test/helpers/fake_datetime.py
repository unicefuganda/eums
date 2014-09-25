from datetime import datetime


class FakeDatetime(datetime):
    fixed_now = None

    @classmethod
    def now(cls, **kwargs):
        cls.fixed_now = cls(2014, 9, 25)
        return cls.fixed_now
