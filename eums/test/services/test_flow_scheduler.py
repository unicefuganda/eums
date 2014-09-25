from unittest import TestCase

from mockito import mock, verify, when

from eums import celery
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.services.mock_celery import MockCelery

celery.app.task = MockCelery().task

from eums.rapid_pro import rapid_pro_facade

fake_facade = mock()
rapid_pro_facade.start_delivery_flow = fake_facade.start_delivery_flow

from eums.services.flow_scheduler import schedule_flows_for


class FlowSchedulerTest(TestCase):
    def test_should_schedule_a_flow_for_a_consignee_from_a_plan_setting_sender_as_unicef_if_node_has_no_parent(self):
        consignee = ConsigneeFactory()
        contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}
        when(consignee).build_contact().thenReturn(contact)
        node = DistributionPlanNodeFactory(consignee=consignee)
        DistributionPlanLineItemFactory(distribution_plan_node=node)

        schedule_flows_for(node)

        line_item = node.distributionplanlineitem_set.all()[0]

        verify(fake_facade).start_delivery_flow(
            sender='UNICEF',
            consignee=contact,
            item_description=line_item.item.description,
        )