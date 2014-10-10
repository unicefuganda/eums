import factory

from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
from eums.test.factories.user_factory import UserFactory
from eums.models import DistributionPlanLineItem
from eums.test.helpers.fake_datetime import FakeDate


class DistributionPlanLineItemFactory(factory.DjangoModelFactory):
    class Meta:
        model = DistributionPlanLineItem

    item = factory.SubFactory(SalesOrderItemFactory)
    targeted_quantity = 10
    planned_distribution_date = FakeDate.today()
    programme_focal = factory.SubFactory(UserFactory)
    consignee = factory.SubFactory(ConsigneeFactory)
    contact_person = 'Test User'
    contact_phone_number = '0110110111'
    destination_location = "Kampala"
    mode_of_delivery = "Road"
    tracked = True
    remark = "In good condition"
    distribution_plan_node = factory.SubFactory(DistributionPlanNodeFactory)
