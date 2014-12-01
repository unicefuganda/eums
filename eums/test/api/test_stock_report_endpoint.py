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
    def xtest_gets_stock_value_for_all_sales_orders_for_an_ip(self):
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

        plan_item_one = DistributionPlanLineItemFactory(distribution_plan_node=ip_node_one, item=item_one,
                                                        targeted_quantity=5)
        plan_item_two = DistributionPlanLineItemFactory(distribution_plan_node=ip_node_two, item=item_two,
                                                        targeted_quantity=3)
        plan_item_three = DistributionPlanLineItemFactory(distribution_plan_node=ip_node_two, item=item_three,
                                                          targeted_quantity=2)

        plan_item_four = DistributionPlanLineItemFactory(distribution_plan_node=middle_man_node_one,
                                                         item=item_one,
                                                         targeted_quantity=2)
        plan_item_five = DistributionPlanLineItemFactory(distribution_plan_node=middle_man_node_two,
                                                         item=item_two,
                                                         targeted_quantity=2)
        plan_item_six = DistributionPlanLineItemFactory(distribution_plan_node=end_user_node,
                                                        item=item_three,
                                                        targeted_quantity=2)

        expected_data = [{'document_number': u'' + sales_order_one.order_number,
                          'document_id': sales_order_one.id,
                          'total_value_received': Decimal('80.0000'),
                          'total_value_dispensed': Decimal('40.0000'),
                          'balance': Decimal('40.0000'),
                          'items': [{'code': item_one.item.material_code,
                                     'description': item_one.item.description,
                                     'quantity_delivered': 5,
                                     'date_delivered': plan_item_one.planned_distribution_date,
                                     'quantity_confirmed': 5,
                                     'date_confirmed': plan_item_one.planned_distribution_date,
                                     'quantity_dispatched': 2,
                                     'date_dispatched': plan_item_six.planned_distribution_date
                                    },
                                    {'code': item_two.item.material_code,
                                     'description': item_two.item.description,
                                     'quantity_delivered': 3,
                                     'date_delivered': plan_item_two.planned_distribution_date,
                                     'quantity_confirmed': 3,
                                     'date_confirmed': plan_item_two.planned_distribution_date,
                                     'quantity_dispatched': 2,
                                     'date_dispatched': plan_item_five.planned_distribution_date
                                    }]},
                         {'document_number': u'' + sales_order_two.order_number,
                          'document_id': sales_order_two.id,
                          'total_value_received': Decimal('20.0000'),
                          'total_value_dispensed': Decimal('20.0000'),
                          'balance': Decimal('0.0000'),
                          'items': [{'code': item_three.item.material_code,
                                     'description': item_three.item.description,
                                     'quantity_delivered': 2,
                                     'date_delivered': plan_item_three.planned_distribution_date,
                                     'quantity_confirmed': 2,
                                     'date_confirmed': plan_item_three.planned_distribution_date,
                                     'quantity_dispatched': 2,
                                     'date_dispatched': plan_item_six.planned_distribution_date
                                    }]}]

        endpoint_url = BACKEND_URL + 'stock-report/%s/' % ip.id
        response = self.client.get(endpoint_url)
        self.assertEqual(response.data, expected_data)



