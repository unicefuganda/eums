from decimal import Decimal

from eums.models import DistributionPlanNode, Consignee, NumericQuestion, TextQuestion, DistributionPlan, PurchaseOrder, \
    PurchaseOrderItem, Run, SalesOrderItem, SalesOrder
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.question_factory import TextQuestionFactory, NumericQuestionFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.factories.answer_factory import NumericAnswerFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory


class StockReportResponsesEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(StockReportResponsesEndpointTest, self).setUp()
        self.clean()

        self.setup_questions()
        self.setup_actors()
        self.setup_purchase_orders_and_items()
        self.setup_distribution_plans()

    def clean(self):
        DistributionPlanNode.objects.all().delete()
        Consignee.objects.all().delete()
        NumericQuestion.objects.all().delete()
        TextQuestion.objects.all().delete()
        Consignee.objects.all().delete()
        DistributionPlan.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        PurchaseOrderItem.objects.all().delete()
        Run.objects.all().delete()
        SalesOrder.objects.all().delete()
        SalesOrderItem.objects.all().delete()

    def test_gets_stock_value_for_all_purchase_orders_for_an_ip(self):
        self.setup_responses()

        expected_data = [
            {'document_number': self.po_two.order_number,
             'total_value_received': Decimal('20'),
             'total_value_dispensed': Decimal('20'),
             'balance': Decimal('0'),
             'items': [{'code': unicode(self.po_item_three.item.material_code),
                        'description': unicode(self.po_item_three.item.description),
                        'quantity_delivered': 2,
                        'date_delivered': str(self.ip_node_three.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-03',
                        'quantity_dispatched': 2,
                        'balance': 0
                        }]},
            {'document_number': self.po_one.order_number,
             'total_value_received': Decimal('60'),
             'total_value_dispensed': Decimal('40'),
             'balance': Decimal('20'),
             'items': [{'code': unicode(self.po_item_two.item.material_code),
                        'description': unicode(self.po_item_two.item.description),
                        'quantity_delivered': 3,
                        'date_delivered': str(self.ip_node_two.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-02',
                        'quantity_dispatched': 2,
                        'balance': 0
                        },
                       {'code': unicode(self.po_item_one.item.material_code),
                        'description': unicode(self.po_item_one.item.description),
                        'quantity_delivered': 5,
                        'date_delivered': str(self.ip_node_one.delivery_date),
                        'quantity_confirmed': 4,
                        'date_confirmed': '2014-01-01',
                        'quantity_dispatched': 2,
                        'balance': 2
                        }
                       ]}]

        endpoint_url = BACKEND_URL + 'stock-report/%s/' % self.ip.id
        response = self.client.get(endpoint_url)
        self.assert_api_response(response, expected_data)

    def test_gets_stock_value_for_all_purchase_orders_for_all_ips(self):
        self.setup_responses()
        self.add_a_node_with_response()

        expected_data = [
            {'document_number': self.po_two.order_number,
             'total_value_received': Decimal('20'),
             'total_value_dispensed': Decimal('20'),
             'balance': Decimal('0'),
             'items': [{'code': unicode(self.po_item_three.item.material_code),
                        'description': unicode(self.po_item_three.item.description),
                        'quantity_delivered': 2,
                        'date_delivered': str(self.ip_node_three.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-03',
                        'quantity_dispatched': 2,
                        'balance': 0
                        }]},
            {'document_number': self.po_one.order_number,
             'total_value_received': Decimal('60'),
             'total_value_dispensed': Decimal('40'),
             'balance': Decimal('20'),
             'items': [{'code': unicode(self.po_item_two.item.material_code),
                        'description': unicode(self.po_item_two.item.description),
                        'quantity_delivered': 3,
                        'date_delivered': str(self.ip_node_two.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-02',
                        'quantity_dispatched': 2,
                        'balance': 0
                        },
                       {'code': unicode(self.po_item_one.item.material_code),
                        'description': unicode(self.po_item_one.item.description),
                        'quantity_delivered': 5,
                        'date_delivered': str(self.ip_node_one.delivery_date),
                        'quantity_confirmed': 4,
                        'date_confirmed': '2014-01-01',
                        'quantity_dispatched': 2,
                        'balance': 2
                        }]
             },
            {
                'document_number': 4748278,
                'balance': 100.0,
                'total_value_received': 400.0,
                'total_value_dispensed': 300.0,
                'items': [{'code': 'Code 23',
                           'quantity_dispatched': 30,
                           'quantity_delivered': 40,
                           'description': 'Jerrycans',
                           'date_delivered': '2014-09-25',
                           'date_confirmed': 'None',
                           'balance': 10,
                           'quantity_confirmed': 40
                           }]
            }]

        endpoint_url = BACKEND_URL + 'stock-report/'
        response = self.client.get(endpoint_url)

        self.assertEqual(len(response.data), 3)
        self.assert_api_response(response, expected_data)

    def add_a_node_with_response(self):
        delivery = DeliveryFactory(track=True)
        purchase_order = PurchaseOrderFactory(order_number=4748278)
        po_item = PurchaseOrderItemFactory(purchase_order=purchase_order,
                                           item=ItemFactory(material_code='Code 23', description='Jerrycans'))
        ip_node_one = DeliveryNodeFactory(programme=delivery.programme, distribution_plan=delivery, item=po_item,
                                          quantity=40, acknowledged=40, balance=40,
                                          tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        run_one = RunFactory(runnable=ip_node_one)

        quantity_received_qn = NumericQuestion.objects.get(label='amountReceived')

        NumericAnswerFactory(question=quantity_received_qn, value=40, run=run_one)

        end_node_one = DeliveryNodeFactory(programme=delivery.programme,
                                           consignee=self.end_user,
                                           parents=[(ip_node_one, 30)],
                                           tree_position=DistributionPlanNode.END_USER,
                                           item=po_item)
        run_end_node_one = RunFactory(runnable=end_node_one)

        NumericAnswerFactory(question=quantity_received_qn, value=43, run=run_end_node_one)

    def assert_api_response(self, response, expected_data):
        for stock in expected_data:
            stock_in_response = \
                filter(lambda stock_: stock_['document_number'] == stock['document_number'], response.data)[0]
            for key in ['total_value_received', 'total_value_dispensed', 'balance']:
                self.assertEquals(stock_in_response[key], stock[key])
            for item in stock['items']:
                self.assertIn(item, stock_in_response['items'])

    def test_returns_correct_balance(self):
        ip = ConsigneeFactory(type=Consignee.TYPES.implementing_partner)

        delivery = DeliveryFactory(consignee=ip, track=True)
        purchase_order = PurchaseOrderFactory()
        po_item = PurchaseOrderItemFactory(purchase_order=purchase_order)
        ip_node_one = DeliveryNodeFactory(programme=delivery.programme, consignee=ip, distribution_plan=delivery,
                                          item=po_item,
                                          quantity=40, acknowledged=40, balance=40,
                                          tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
        ip_node_two = DeliveryNodeFactory(programme=delivery.programme, consignee=ip, distribution_plan=delivery,
                                          item=po_item,
                                          quantity=30, acknowledged=30, balance=30,
                                          tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)

        run_one = RunFactory(runnable=ip_node_one)
        run_two = RunFactory(runnable=ip_node_two)

        quantity_received_qn = NumericQuestion.objects.get(label='amountReceived')

        NumericAnswerFactory(question=quantity_received_qn, value=40, run=run_one)
        NumericAnswerFactory(question=quantity_received_qn, value=30, run=run_two)

        end_node_one = DeliveryNodeFactory(programme=delivery.programme,
                                           consignee=self.end_user,
                                           parents=[(ip_node_one, 30), (ip_node_two, 15)],
                                           tree_position=DistributionPlanNode.END_USER,
                                           item=po_item)
        end_node_two = DeliveryNodeFactory(programme=delivery.programme,
                                           consignee=self.end_user,
                                           parents=[(ip_node_one, 5), (ip_node_two, 5)],
                                           tree_position=DistributionPlanNode.END_USER,
                                           item=po_item)
        run_end_node_one = RunFactory(runnable=end_node_one)
        run_end_node_two = RunFactory(runnable=end_node_two)

        NumericAnswerFactory(question=quantity_received_qn, value=43, run=run_end_node_one)
        NumericAnswerFactory(question=quantity_received_qn, value=10, run=run_end_node_two)

        endpoint_url = BACKEND_URL + 'stock-report/%s/' % ip.id
        response = self.client.get(endpoint_url)

        expected_data = [
            {'document_number': purchase_order.order_number,
             'total_value_received': Decimal('700'),
             'total_value_dispensed': Decimal('550'),
             'balance': Decimal('150'),
             'items': [{'code': unicode(po_item.item.material_code),
                        'description': unicode(po_item.item.description),
                        'quantity_delivered': 30,
                        'date_delivered': str(end_node_one.delivery_date),
                        'quantity_confirmed': 30,
                        'date_confirmed': 'None',
                        'quantity_dispatched': 20,
                        'balance': 10
                        },
                       {'code': unicode(po_item.item.material_code),
                        'description': unicode(po_item.item.description),
                        'quantity_delivered': 40,
                        'date_delivered': str(end_node_one.delivery_date),
                        'quantity_confirmed': 40,
                        'date_confirmed': 'None',
                        'quantity_dispatched': 35,
                        'balance': 5
                        }]
             }
        ]

        self.assert_api_response(response, expected_data)

    def setup_responses(self):
        self.setup_runs()
        self.setup_answers()

    def setup_quantity_received_answers(self):
        quantity_received_qn = NumericQuestion.objects.get(label='amountReceived')
        quantity_received_qn.numericanswer_set.create(value=4, run=self.run_one)
        quantity_received_qn.numericanswer_set.create(value=2, run=self.run_two)
        quantity_received_qn.numericanswer_set.create(value=2, run=self.run_three)
        quantity_received_qn.numericanswer_set.create(value=1, run=self.run_four)
        quantity_received_qn.numericanswer_set.create(value=1, run=self.run_five)
        quantity_received_qn.numericanswer_set.create(value=1, run=self.run_six)

    def setup_answers(self):
        self.setup_quantity_received_answers()
        self.setup_date_received_answers()

    def setup_date_received_answers(self):
        date_received_question = TextQuestion.objects.get(label='dateOfReceipt')
        date_received_question.textanswer_set.create(value='2014-01-01', run=self.run_one)
        date_received_question.textanswer_set.create(value='2014-01-02', run=self.run_two)
        date_received_question.textanswer_set.create(value='2014-01-03', run=self.run_three)

    def setup_runs(self):
        self.run_one = RunFactory(runnable=self.ip_node_one)
        self.run_two = RunFactory(runnable=self.ip_node_two)
        self.run_three = RunFactory(runnable=self.ip_node_three)
        self.run_four = RunFactory(runnable=self.middle_man_node_one)
        self.run_five = RunFactory(runnable=self.middle_man_node_two)
        self.run_six = RunFactory(runnable=self.end_user_node)

    def setup_purchase_orders(self):
        self.po_one = PurchaseOrderFactory(sales_order=self.po_one)
        self.po_two = PurchaseOrderFactory(sales_order=self.po_two)
        self.setup_purchase_order_items()

    def setup_purchase_order_items(self):
        self.po_item_one = PurchaseOrderItemFactory(purchase_order=self.po_one, sales_order_item=self.po_item_one)
        self.po_item_two = PurchaseOrderItemFactory(purchase_order=self.po_one, sales_order_item=self.po_item_two)
        self.po_item_three = PurchaseOrderItemFactory(purchase_order=self.po_two, sales_order_item=self.po_item_three)

    def setup_actors(self):
        self.ip = ConsigneeFactory(type=Consignee.TYPES.implementing_partner)
        self.middle_man_one = ConsigneeFactory(type=Consignee.TYPES.middle_man)
        self.middle_man_two = ConsigneeFactory(type=Consignee.TYPES.middle_man)
        self.end_user = ConsigneeFactory(type=Consignee.TYPES.end_user)

    def setup_purchase_orders_and_items(self):
        so_one = SalesOrderFactory()
        so_two = SalesOrderFactory()

        so_item_one = SalesOrderItemFactory(sales_order=so_one, quantity=10, net_price=10, net_value=10 * 10)
        so_item_two = SalesOrderItemFactory(sales_order=so_one, quantity=5, net_price=10, net_value=5 * 10)
        so_item_three = SalesOrderItemFactory(sales_order=so_two, quantity=2, net_price=10, net_value=2 * 10)

        self.po_one = PurchaseOrderFactory()
        self.po_two = PurchaseOrderFactory()

        self.po_item_one = PurchaseOrderItemFactory(purchase_order=self.po_one, quantity=10,
                                                    sales_order_item=so_item_one, value=100)
        self.po_item_two = PurchaseOrderItemFactory(purchase_order=self.po_one, quantity=5,
                                                    sales_order_item=so_item_two, value=50)
        self.po_item_three = PurchaseOrderItemFactory(purchase_order=self.po_two, quantity=2,
                                                      sales_order_item=so_item_three, value=20)

    def setup_distribution_plans(self):
        self.plan_one = DeliveryFactory()
        self.plan_two = DeliveryFactory()
        self.plan_three = DeliveryFactory()
        self.setup_nodes()

    def setup_nodes(self):
        self.ip_node_one = DeliveryNodeFactory(distribution_plan=self.plan_one, consignee=self.ip,
                                               tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER,
                                               item=self.po_item_one, quantity=5)
        self.ip_node_two = DeliveryNodeFactory(distribution_plan=self.plan_two, consignee=self.ip,
                                               tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER,
                                               item=self.po_item_two, quantity=3)
        self.ip_node_three = DeliveryNodeFactory(distribution_plan=self.plan_three, consignee=self.ip,
                                                 tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER,
                                                 item=self.po_item_three, quantity=2)

        self.middle_man_node_one = DeliveryNodeFactory(consignee=self.middle_man_one, programme=self.plan_one.programme,
                                                       tree_position=DistributionPlanNode.MIDDLE_MAN,
                                                       parents=[(self.ip_node_one, 2)], item=self.po_item_one)
        self.middle_man_node_two = DeliveryNodeFactory(consignee=self.middle_man_two, programme=self.plan_two.programme,
                                                       tree_position=DistributionPlanNode.MIDDLE_MAN,
                                                       parents=[(self.ip_node_two, 2)], item=self.po_item_two)
        self.end_user_node = DeliveryNodeFactory(consignee=self.end_user, programme=self.plan_three.programme,
                                                 tree_position=DistributionPlanNode.END_USER,
                                                 parents=[(self.ip_node_three, 2)], item=self.po_item_three)

    def setup_questions(self):
        TextQuestionFactory(label='dateOfReceipt')
        NumericQuestionFactory(label='amountReceived')
