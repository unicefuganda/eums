from decimal import Decimal

from eums.fixtures.flows import seed_flows
seed_flows()

from eums.fixtures.questions import seed_questions
from eums.models import DistributionPlanNode, Consignee, NumericQuestion, TextQuestion
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.distribution_plan_factory import DistributionPlanFactory
from eums.test.factories.distribution_plan_line_item_factory import DistributionPlanLineItemFactory
from eums.test.factories.distribution_plan_node_factory import DistributionPlanNodeFactory
from eums.test.factories.node_line_item_run_factory import NodeLineItemRunFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class StockReportResponsesEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(StockReportResponsesEndpointTest, self).setUp()
        self.setup_actors()
        self.setup_sales_orders_and_items()
        self.setup_distribution_plans()

    def test_gets_stock_value_for_all_purchase_orders_for_an_ip(self):
        self.setup_purchase_orders()
        self.setup_responses()

        expected_data = [{'document_number': self.po_one.order_number,
                          'total_value_received': Decimal('60.0000'),
                          'total_value_dispensed': Decimal('20.0000'),
                          'balance': Decimal('40.0000'),
                          'items': [{'code': unicode(self.po_item_two.sales_order_item.item.material_code),
                                     'description': unicode(self.po_item_two.sales_order_item.item.description),
                                     'quantity_delivered': 3,
                                     'date_delivered': str(self.plan_item_two.planned_distribution_date),
                                     'quantity_confirmed': 2L,
                                     'date_confirmed': '2014-01-02',
                                     'quantity_dispatched': 1L,
                                     'balance': 1L
                                    },
                                    {'code': unicode(self.po_item_one.sales_order_item.item.material_code),
                                     'description': unicode(self.po_item_one.sales_order_item.item.description),
                                     'quantity_delivered': 5,
                                     'date_delivered': str(self.plan_item_one.planned_distribution_date),
                                     'quantity_confirmed': 4L,
                                     'date_confirmed': '2014-01-01',
                                     'quantity_dispatched': 1L,
                                     'balance': 3L
                                    }
                          ]},
                         {'document_number': self.po_two.order_number,
                          'total_value_received': Decimal('10.0000'),
                          'total_value_dispensed': Decimal('10.0000'),
                          'balance': Decimal('0.0000'),
                          'items': [{'code': unicode(self.po_item_three.sales_order_item.item.material_code),
                                     'description': unicode(self.po_item_three.sales_order_item.item.description),
                                     'quantity_delivered': 2,
                                     'date_delivered': str(self.plan_item_three.planned_distribution_date),
                                     'quantity_confirmed': 1L,
                                     'date_confirmed': '2014-01-03',
                                     'quantity_dispatched': 1L,
                                     'balance': 0L
                                    }]}]

        endpoint_url = BACKEND_URL + 'stock-report/%s/' % self.ip.id
        response = self.client.get(endpoint_url)
        self.assertListEqual(response.data, expected_data)

    def test_returns_empty_list_if_no_matching_purchase_order_linked_to_the_line_item_exists(self):
        self.setup_responses()
        endpoint_url = BACKEND_URL + 'stock-report/%s/' % self.ip.id
        response = self.client.get(endpoint_url)
        self.assertListEqual(response.data, [])

    def test_returns_empty_list_if_no_runs_where_created_for_the_line_items(self):
        self.setup_purchase_orders()

        expected_data = [{'document_number': self.po_one.order_number,
                          'total_value_received': Decimal('0.0000'),
                          'total_value_dispensed': Decimal('0.0000'),
                          'balance': Decimal('0.0000'),
                          'items': [{'code': unicode(self.po_item_two.sales_order_item.item.material_code),
                                     'description': unicode(self.po_item_two.sales_order_item.item.description),
                                     'quantity_delivered': 3,
                                     'date_delivered': str(self.plan_item_two.planned_distribution_date),
                                     'quantity_confirmed': 0,
                                     'date_confirmed': 'None',
                                     'quantity_dispatched': 0,
                                     'balance': 0
                                    },
                                    {'code': unicode(self.po_item_one.sales_order_item.item.material_code),
                                     'description': unicode(self.po_item_one.sales_order_item.item.description),
                                     'quantity_delivered': 5,
                                     'date_delivered': str(self.plan_item_one.planned_distribution_date),
                                     'quantity_confirmed': 0,
                                     'date_confirmed': 'None',
                                     'quantity_dispatched': 0,
                                     'balance': 0
                                    }
                          ]},
                         {'document_number': self.po_two.order_number,
                          'total_value_received': Decimal('0.0000'),
                          'total_value_dispensed': Decimal('0.0000'),
                          'balance': Decimal('0.0000'),
                          'items': [{'code': unicode(self.po_item_three.sales_order_item.item.material_code),
                                     'description': unicode(self.po_item_three.sales_order_item.item.description),
                                     'quantity_delivered': 2,
                                     'date_delivered': str(self.plan_item_three.planned_distribution_date),
                                     'quantity_confirmed': 0,
                                     'date_confirmed': 'None',
                                     'quantity_dispatched': 0,
                                     'balance': 0
                                    }]}]

        endpoint_url = BACKEND_URL + 'stock-report/%s/' % self.ip.id
        response = self.client.get(endpoint_url)
        self.assertListEqual(response.data, expected_data)

    def setup_responses(self):
        self.setup_runs()
        seed_questions()
        self.setup_answers()

    def setup_quantity_received_answers(self):
        quantity_received_qn = NumericQuestion.objects.get(
            uuids=['69de6032-f4de-412a-9c9e-ed98fb9bca93', '9af2907a-d3a6-41ee-8a12-0b3197d30baf'])
        quantity_received_qn.numericanswer_set.create(value=4, line_item_run=self.run_one)
        quantity_received_qn.numericanswer_set.create(value=2, line_item_run=self.run_two)
        quantity_received_qn.numericanswer_set.create(value=1, line_item_run=self.run_three)
        quantity_received_qn.numericanswer_set.create(value=1, line_item_run=self.run_four)
        quantity_received_qn.numericanswer_set.create(value=1, line_item_run=self.run_five)
        quantity_received_qn.numericanswer_set.create(value=1, line_item_run=self.run_six)

    def setup_answers(self):
        self.setup_quantity_received_answers()
        self.setup_date_received_answers()

    def setup_date_received_answers(self):
        date_received_question = TextQuestion.objects.get(
            uuids=['abc9c005-7a7c-44f8-b946-e970a361b6cf', '884ed6d8-1cef-4878-999d-bce7de85e27c'])
        date_received_question.textanswer_set.create(value='2014-01-01', line_item_run=self.run_one)
        date_received_question.textanswer_set.create(value='2014-01-02', line_item_run=self.run_two)
        date_received_question.textanswer_set.create(value='2014-01-03', line_item_run=self.run_three)

    def setup_runs(self):
        self.run_one = NodeLineItemRunFactory(node_line_item=self.plan_item_one)
        self.run_two = NodeLineItemRunFactory(node_line_item=self.plan_item_two)
        self.run_three = NodeLineItemRunFactory(node_line_item=self.plan_item_three)
        self.run_four = NodeLineItemRunFactory(node_line_item=self.plan_item_four)
        self.run_five = NodeLineItemRunFactory(node_line_item=self.plan_item_five)
        self.run_six = NodeLineItemRunFactory(node_line_item=self.plan_item_six)

    def setup_purchase_orders(self):
        self.po_one = PurchaseOrderFactory(sales_order=self.so_one)
        self.po_two = PurchaseOrderFactory(sales_order=self.so_two)
        self.setup_purchase_order_items()

    def setup_purchase_order_items(self):
        self.po_item_one = PurchaseOrderItemFactory(purchase_order=self.po_one, sales_order_item=self.so_item_one)
        self.po_item_two = PurchaseOrderItemFactory(purchase_order=self.po_one, sales_order_item=self.so_item_two)
        self.po_item_three = PurchaseOrderItemFactory(purchase_order=self.po_two, sales_order_item=self.so_item_three)

    def setup_actors(self):
        self.ip = ConsigneeFactory(type=Consignee.TYPES.implementing_partner)
        self.middle_man_one = ConsigneeFactory(type=Consignee.TYPES.middle_man)
        self.middle_man_two = ConsigneeFactory(type=Consignee.TYPES.middle_man)
        self.end_user = ConsigneeFactory(type=Consignee.TYPES.end_user)

    def setup_sales_orders_and_items(self):
        self.so_one = SalesOrderFactory()
        self.so_two = SalesOrderFactory()

        self.so_item_one = SalesOrderItemFactory(sales_order=self.so_one, quantity=10, net_price=10, net_value=10 * 10)
        self.so_item_two = SalesOrderItemFactory(sales_order=self.so_one, quantity=5, net_price=10, net_value=5 * 10)
        self.so_item_three = SalesOrderItemFactory(sales_order=self.so_two, quantity=2, net_price=10, net_value=2 * 10)

    def setup_distribution_plans(self):
        self.plan_one = DistributionPlanFactory()
        self.plan_two = DistributionPlanFactory()
        self.plan_three = DistributionPlanFactory()
        self.setup_nodes()
        self.setup_plan_items()

    def setup_plan_items(self):
        self.plan_item_one = DistributionPlanLineItemFactory(distribution_plan_node=self.ip_node_one,
                                                             item=self.so_item_one, targeted_quantity=5)
        self.plan_item_two = DistributionPlanLineItemFactory(distribution_plan_node=self.ip_node_two,
                                                             item=self.so_item_two, targeted_quantity=3)
        self.plan_item_three = DistributionPlanLineItemFactory(distribution_plan_node=self.ip_node_two,
                                                               item=self.so_item_three, targeted_quantity=2)

        self.plan_item_four = DistributionPlanLineItemFactory(distribution_plan_node=self.middle_man_node_one,
                                                              item=self.so_item_one, targeted_quantity=2)
        self.plan_item_five = DistributionPlanLineItemFactory(distribution_plan_node=self.middle_man_node_two,
                                                              item=self.so_item_two, targeted_quantity=2)
        self.plan_item_six = DistributionPlanLineItemFactory(distribution_plan_node=self.end_user_node,
                                                             item=self.so_item_three, targeted_quantity=2)

    def setup_nodes(self):
        self.ip_node_one = DistributionPlanNodeFactory(distribution_plan=self.plan_one, consignee=self.ip,
                                                       tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        self.ip_node_two = DistributionPlanNodeFactory(distribution_plan=self.plan_two, consignee=self.ip,
                                                       tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        self.ip_node_three = DistributionPlanNodeFactory(distribution_plan=self.plan_three, consignee=self.ip,
                                                         tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)

        self.middle_man_node_one = DistributionPlanNodeFactory(distribution_plan=self.plan_three,
                                                               consignee=self.middle_man_one,
                                                               tree_position=DistributionPlanNode.MIDDLE_MAN,
                                                               parent=self.ip_node_one)
        self.middle_man_node_two = DistributionPlanNodeFactory(distribution_plan=self.plan_three,
                                                               consignee=self.middle_man_two, parent=self.ip_node_two,
                                                               tree_position=DistributionPlanNode.MIDDLE_MAN)
        self.end_user_node = DistributionPlanNodeFactory(distribution_plan=self.plan_three, consignee=self.end_user,
                                                         tree_position=DistributionPlanNode.END_USER,
                                                         parent=self.ip_node_three)