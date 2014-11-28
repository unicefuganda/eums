from eums.models import SalesOrderItem
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
import factory


class SalesOrderItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = SalesOrderItem

    sales_order = factory.SubFactory(SalesOrderFactory)
    item = factory.SubFactory(ItemFactory)
    item_number = factory.Sequence(lambda n: 10 * n)
    quantity = 100
    net_price = 10.00
    net_value = 1000.00
    issue_date = '2014-10-09'
    delivery_date = '2014-10-14'
    description = 'Nets'
