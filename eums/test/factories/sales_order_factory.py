import datetime
from eums.models import SalesOrder
from eums.test.factories.programme_factory import ProgrammeFactory
import factory


class SalesOrderFactory(factory.DjangoModelFactory):
    class Meta:
        model = SalesOrder

    programme = factory.SubFactory(ProgrammeFactory)
    order_number = factory.Sequence(lambda n: int("2014{0}".format(n)))
    date = datetime.date.today()