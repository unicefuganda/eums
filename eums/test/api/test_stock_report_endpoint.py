from decimal import Decimal

from eums.models import DistributionPlanNode, Consignee
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class StockReportResponsesEndpointTest(AuthenticatedAPITestCase):
    def test_gets_stock_value_for_all_sales_orders_for_an_ip(self):
        ip = ConsigneeFactory(type=Consignee.TYPES.implementing_partner)
        middle_man_one = ConsigneeFactory(type=Consignee.TYPES.middle_man)
        middle_man_two = ConsigneeFactory(type=Consignee.TYPES.middle_man)
        end_user = ConsigneeFactory(type=Consignee.TYPES.end_user)

        sales_order_one = SalesOrderFactory()
        sales_order_two = SalesOrderFactory()

        item_one_quantity = 10
        item_two_quantity = 5
        item_three_quantity = 2

        item_one_net_price = 10
        item_two_net_price = 10
        item_three_net_price = 10

        item_one = SalesOrderItemFactory(sales_order=sales_order_one, quantity=item_one_quantity,
                                         net_price=item_one_net_price, net_value=item_one_quantity * item_one_net_price)
        item_two = SalesOrderItemFactory(sales_order=sales_order_one, quantity=item_two_quantity,
                                         net_price=item_two_net_price, net_value=item_two_quantity * item_two_net_price)
        item_three = SalesOrderItemFactory(sales_order=sales_order_two, quantity=item_three_quantity,
                                           net_price=item_three_net_price,
                                           net_value=item_three_quantity * item_three_net_price)

        plan_one = DistributionPlanFactory()
        plan_two = DistributionPlanFactory()
        plan_three = DistributionPlanFactory()

        ip_node_one = DistributionPlanNodeFactory(distribution_plan=plan_one, consignee=ip,
                                                  tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        ip_node_two = DistributionPlanNodeFactory(distribution_plan=plan_two, consignee=ip,
                                                  tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        ip_node_three = DistributionPlanNodeFactory(distribution_plan=plan_three, consignee=ip,
                                                    tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)

        middle_man_node_one = DistributionPlanNodeFactory(distribution_plan=plan_three, consignee=middle_man_one,
                                                          tree_position=DistributionPlanNode.MIDDLE_MAN,
                                                          parent=ip_node_one)
        middle_man_node_two = DistributionPlanNodeFactory(distribution_plan=plan_three, consignee=middle_man_two,
                                                          tree_position=DistributionPlanNode.MIDDLE_MAN,
                                                          parent=ip_node_two)
        end_user_node = DistributionPlanNodeFactory(distribution_plan=plan_three, consignee=end_user,
                                                    tree_position=DistributionPlanNode.END_USER,
                                                    parent=ip_node_three)

        DistributionPlanLineItemFactory(distribution_plan_node=ip_node_one, item=item_one,
                                        targeted_quantity=5)
        DistributionPlanLineItemFactory(distribution_plan_node=ip_node_two, item=item_two,
                                        targeted_quantity=3)
        DistributionPlanLineItemFactory(distribution_plan_node=ip_node_two, item=item_three,
                                        targeted_quantity=2)

        DistributionPlanLineItemFactory(distribution_plan_node=middle_man_node_one,
                                        item=item_one,
                                        targeted_quantity=2)
        DistributionPlanLineItemFactory(distribution_plan_node=middle_man_node_two,
                                        item=item_two,
                                        targeted_quantity=2)
        DistributionPlanLineItemFactory(distribution_plan_node=end_user_node,
                                        item=item_three,
                                        targeted_quantity=2)

        expected_data = [{'document_number': u'' + sales_order_one.order_number,
                          'total_value_received': Decimal('80.0000'),
                          'total_value_dispensed': Decimal('40.0000'),
                          'balance': Decimal('40.0000')},
                         {'document_number': u'' + sales_order_two.order_number,
                          'total_value_received': Decimal('20.0000'),
                          'total_value_dispensed': Decimal('20.0000'),
                          'balance': Decimal('0.0000')}]

        endpoint_url = BACKEND_URL + 'stock-report/%s/' % ip.id
        response = self.client.get(endpoint_url)
        self.assertEqual(response.data, expected_data)



