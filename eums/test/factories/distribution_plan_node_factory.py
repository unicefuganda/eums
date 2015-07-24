import factory

from eums.test.factories.order_item_factory import OrderItemFactory
from eums.test.helpers.fake_datetime import FakeDate
from eums.models import DistributionPlanNode
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory


class DistributionPlanNodeFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionPlanNode

    parent = None
    distribution_plan = factory.SubFactory(DistributionPlanFactory)
    consignee = factory.SubFactory(ConsigneeFactory)
    tree_position = DistributionPlanNode.END_USER
    location = "Kampala"
    contact_person_id = factory.Sequence(lambda n: "{0}".format(n))
    item = factory.SubFactory(OrderItemFactory)
    track = False
    targeted_quantity = 10
    delivery_date = FakeDate.today()
    remark = "In good condition"
