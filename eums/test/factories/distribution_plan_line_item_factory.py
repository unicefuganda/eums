from datetime import datetime

import factory

from eums.models import DistributionPlanLineItem
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.item_factory import ItemFactory


class DistributionPlanLineItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionPlanLineItem

    item = factory.SubFactory(ItemFactory)
    quantity = 10
    under_current_supply_plan = False
    planned_distribution_date = datetime.now()
    destination_location = "Kampala"
    remark = "In good condition"
    distribution_plan_node = factory.SubFactory(DistributionPlanNodeFactory)
