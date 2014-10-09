import datetime
from eums.models import SalesOrder
from eums.test.factories.programme_factory import ProgrammeFactory
import factory


class SalesOrderFactory(factory.DjangoModelFactory):
    class Meta:
        model = SalesOrder

    programme = factory.SubFactory(ProgrammeFactory)
    date = datetime.date.today()