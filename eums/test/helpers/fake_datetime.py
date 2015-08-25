from datetime import datetime, date


class FakeDatetime(datetime):
    @classmethod
    def now(cls, **kwargs):
        return cls(2014, 9, 25)


class FakeDate(date):
    @classmethod
    def today(cls):
        return cls(2014, 9, 25)

    @classmethod
    def build(cls, year,month, day):
        return date(year, month, day)


