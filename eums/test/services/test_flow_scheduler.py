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
    def setUp(self):
        self.consignee = ConsigneeFactory()
        self.contact = {'first_name': 'Test', 'last_name': 'User', 'phone': '+256 772 123456'}

    def test_should_schedule_a_flow_with_sender_as_unicef_if_node_has_no_parent(self):
        node = DistributionPlanNodeFactory(consignee=self.consignee)
        DistributionPlanLineItemFactory(distribution_plan_node=node)

        when(self.consignee).build_contact().thenReturn(self.contact)
        schedule_flows_for(node)

        line_item = node.distributionplanlineitem_set.all()[0]

        verify(fake_facade).start_delivery_flow(
            sender='UNICEF',
            consignee=self.contact,
            item_description=line_item.item.description,
        )

    def test_should_schedule_flow_with_sender_as_parent_node_consignee_name_if_node_has_parent(self):
        sender_org_name = "Dwelling Places"
        sender_org = ConsigneeFactory(name=sender_org_name)
        parent_node = DistributionPlanNodeFactory(consignee=sender_org)
        node = DistributionPlanNodeFactory(consignee=self.consignee, parent=parent_node)
        DistributionPlanLineItemFactory(distribution_plan_node=node)

        when(self.consignee).build_contact().thenReturn(self.contact)
        schedule_flows_for(node)

        line_item = node.distributionplanlineitem_set.all()[0]

        verify(fake_facade).start_delivery_flow(
            sender=sender_org_name,
            consignee=self.contact,
            item_description=line_item.item.description,
        )

    def tearDown(self):
        fake_facade.invocations = []