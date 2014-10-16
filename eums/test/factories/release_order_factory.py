import datetime
import factory
from eums.models import ReleaseOrder
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory


class ReleaseOrderFactory(factory.DjangoModelFactory):
    class Meta:
        model = ReleaseOrder

    order_number = factory.Sequence(lambda n: "2014{0}".format(n))
    sales_order = factory.SubFactory(SalesOrderFactory)
    consignee = factory.SubFactory(ConsigneeFactory)
    waybill = factory.Sequence(lambda n: "{0}".format(n))
    delivery_date = datetime.date.today()
