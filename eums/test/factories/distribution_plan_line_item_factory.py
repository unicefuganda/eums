import factory

from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
from eums.models import DistributionPlanLineItem
from eums.test.helpers.fake_datetime import FakeDate


class DistributionPlanLineItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionPlanLineItem

    item = factory.SubFactory(SalesOrderItemFactory)
    targeted_quantity = 10
    planned_distribution_date = FakeDate.today()
    remark = "In good condition"
    distribution_plan_node = factory.SubFactory(DistributionPlanNodeFactory)
