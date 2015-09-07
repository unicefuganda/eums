import factory
from datetime import datetime

from eums.models import PurchaseOrder
from eums.test.factories.sales_order_factory import SalesOrderFactory


class PurchaseOrderFactory(factory.DjangoModelFactory):
    class Meta:
        model = PurchaseOrder

    order_number = factory.Sequence(lambda n: int("2014{0}".format(n)))
    sales_order = factory.SubFactory(SalesOrderFactory)
    date = datetime.today()
