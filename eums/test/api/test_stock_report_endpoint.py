from decimal import Decimal

from eums.models import DistributionPlanNode, Consignee, NumericQuestion, TextQuestion, DistributionPlan, PurchaseOrder, \
    PurchaseOrderItem, Run, SalesOrderItem, SalesOrder, Runnable
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.item_factory import ItemFactory
from eums.test.factories.option_factory import OptionFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from eums.test.factories.question_factory import TextQuestionFactory, NumericQuestionFactory, \
    MultipleChoiceQuestionFactory
from eums.test.factories.run_factory import RunFactory
from eums.test.factories.answer_factory import NumericAnswerFactory
from eums.test.factories.purchase_order_factory import PurchaseOrderFactory
from eums.test.factories.purchase_order_item_factory import PurchaseOrderItemFactory
from eums.test.factories.sales_order_factory import SalesOrderFactory
from eums.test.factories.sales_order_item_factory import SalesOrderItemFactory
from eums.test.helpers.fake_datetime import FakeDate


class StockReportResponsesEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        super(StockReportResponsesEndpointTest, self).setUp()

        self.setup_flow()
        self.setup_questions()
        self.setup_actors()
        self.setup_purchase_orders_and_items()
        self.setup_distribution_plans()

    def tearDown(self):
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
                        'consignee': self.ip.name,
                        'location': self.ip_node_three.location,
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
                        'consignee': self.ip.name,
                        'location': self.ip_node_two.location,
                        'quantity_delivered': 3,
                        'date_delivered': str(self.ip_node_two.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-02',
                        'quantity_dispatched': 2,
                        'balance': 0
                        },
                       {'code': unicode(self.po_item_one.item.material_code),
                        'description': unicode(self.po_item_one.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_two.location,
                        'quantity_delivered': 5,
                        'date_delivered': str(self.ip_node_one.delivery_date),
                        'quantity_confirmed': 4,
                        'date_confirmed': '2014-01-01',
                        'quantity_dispatched': 2,
                        'balance': 2
                        }
                       ]}]

        endpoint_url = BACKEND_URL + 'stock-report?consignee=%s' % self.ip.id
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
                        'consignee': self.ip.name,
                        'location': self.ip_node_three.location,
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
                        'consignee': self.ip.name,
                        'location': self.ip_node_two.location,
                        'quantity_delivered': 3,
                        'date_delivered': str(self.ip_node_two.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-02',
                        'quantity_dispatched': 2,
                        'balance': 0
                        },
                       {'code': unicode(self.po_item_one.item.material_code),
                        'description': unicode(self.po_item_one.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_one.location,
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
                           'description': 'Jerrycans',
                           'consignee': self.extra_ip_node.consignee.name,
                           'location': self.extra_ip_node.location,
                           'quantity_dispatched': 30,
                           'quantity_delivered': 40,
                           'date_delivered': '2014-09-25',
                           'date_confirmed': '',
                           'balance': 10,
                           'quantity_confirmed': 40
                           }]
            }]

        endpoint_url = BACKEND_URL + 'stock-report'
        response = self.client.get(endpoint_url)

        self.assertEqual(len(response.data['results']), 3)

        self.assert_api_response(response, expected_data)

    def test_should_get_stock_value_for_all_purchase_orders_for_a_location(self):
        self.setup_responses()
        self.ip_node_one.location = 'Luweero'
        self.ip_node_one.save()
        self.ip_node_two.location = 'Luweero'
        self.ip_node_two.save()
        self.add_a_node_with_response()

        expected_data = [
            {'document_number': self.po_one.order_number,
             'total_value_received': Decimal('60'),
             'total_value_dispensed': Decimal('40'),
             'balance': Decimal('20'),
             'items': [{'code': unicode(self.po_item_two.item.material_code),
                        'description': unicode(self.po_item_two.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_two.location,
                        'quantity_delivered': 3,
                        'date_delivered': str(self.ip_node_two.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-02',
                        'quantity_dispatched': 2,
                        'balance': 0
                        },
                       {'code': unicode(self.po_item_one.item.material_code),
                        'description': unicode(self.po_item_one.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_two.location,
                        'quantity_delivered': 5,
                        'date_delivered': str(self.ip_node_one.delivery_date),
                        'quantity_confirmed': 4,
                        'date_confirmed': '2014-01-01',
                        'quantity_dispatched': 2,
                        'balance': 2
                        }
                       ]}]

        endpoint_url = BACKEND_URL + 'stock-report?location=luweero'
        response = self.client.get(endpoint_url)
        self.assertEqual(len(response.data['results']), 1)
        self.assert_api_response(response, expected_data)

    def test_should_get_stock_value_for_all_purchase_orders_for_a_location_and_ip(self):
        self.setup_responses()
        self.ip_node_one.location = 'Luweero'
        self.ip_node_one.save()
        self.ip_node_two.location = 'Luweero'
        self.ip_node_two.save()
        self.ip_node_three.location = 'Koboko'
        self.ip_node_three.save()
        self.add_a_node_with_response()

        expected_data = [
            {'document_number': self.po_two.order_number,
             'total_value_received': Decimal('20'),
             'total_value_dispensed': Decimal('20'),
             'balance': Decimal('0'),
             'items': [{'code': unicode(self.po_item_three.item.material_code),
                        'description': unicode(self.po_item_three.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_three.location,
                        'quantity_delivered': 2,
                        'date_delivered': str(self.ip_node_three.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-03',
                        'quantity_dispatched': 2,
                        'balance': 0
                        }]
             }
        ]

        endpoint_url = BACKEND_URL + 'stock-report?consignee=%d&location=koboko' % self.ip_node_three.consignee.id
        response = self.client.get(endpoint_url)
        self.assertEqual(len(response.data['results']), 1)
        self.assert_api_response(response, expected_data)

    def test_computes_totals_for_all_items_stock_report_before_pagination(self):
        self.setup_responses()
        self.add_a_node_with_response()

        endpoint_url = BACKEND_URL + 'stock-report'
        response = self.client.get(endpoint_url)
        totals = response.data['totals']

        expected_totals = {
            'total_received': Decimal('480'),
            'total_dispensed': Decimal('360'),
            'balance': Decimal('120')
        }
        self.assertDictEqual(totals, expected_totals)

    def test_gets_programme_last_shipment_date_ip_location_values_for_stock_report(self):
        self.setup_responses()

        expected_data = [
            {'document_number': self.po_two.order_number,
             'programme': 'programme_two',
             'last_shipment_date': str(self.ip_node_three.delivery_date),
             'total_value_received': Decimal('20'),
             'total_value_dispensed': Decimal('20'),
             'balance': Decimal('0'),
             'items': [{'code': unicode(self.po_item_three.item.material_code),
                        'description': unicode(self.po_item_three.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_three.location,
                        'quantity_delivered': 2,
                        'date_delivered': str(self.ip_node_three.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-03',
                        'quantity_dispatched': 2,
                        'balance': 0
                        }]},
            {'document_number': self.po_one.order_number,
             'programme': 'programme_one',
             'last_shipment_date': str(self.ip_node_one.delivery_date),
             'total_value_received': Decimal('60'),
             'total_value_dispensed': Decimal('40'),
             'balance': Decimal('20'),
             'items': [{'code': unicode(self.po_item_two.item.material_code),
                        'description': unicode(self.po_item_two.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_two.location,
                        'quantity_delivered': 3,
                        'date_delivered': str(self.ip_node_two.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-02',
                        'quantity_dispatched': 2,
                        'balance': 0
                        },
                       {'code': unicode(self.po_item_one.item.material_code),
                        'description': unicode(self.po_item_one.item.description),
                        'consignee': self.ip.name,
                        'location': self.ip_node_one.location,
                        'quantity_delivered': 5,
                        'date_delivered': str(self.ip_node_one.delivery_date),
                        'quantity_confirmed': 4,
                        'date_confirmed': '2014-01-01',
                        'quantity_dispatched': 2,
                        'balance': 2
                        }]
             }]

        endpoint_url = BACKEND_URL + 'stock-report/'
        response = self.client.get(endpoint_url)

        self.assertEqual(len(response.data['results']), 2)
        self.assert_api_response_with_programme_ip_location(response, expected_data)
        self.assert_api_response_with_correct_last_shipment_date(response, expected_data)

    def test_gets_correct_last_shipment_date_value_for_stock_report(self):
        programme = ProgrammeFactory(name='special_program')
        delivery = DeliveryFactory(track=True, programme=programme)
        sales_order = SalesOrderFactory(programme=programme)
        purchase_order = PurchaseOrderFactory(order_number=4748278, sales_order=sales_order)
        po_item = PurchaseOrderItemFactory(purchase_order=purchase_order,
                                           item=ItemFactory(material_code='Code 23', description='Jerrycans'))

        ip_node_one = DeliveryNodeFactory(distribution_plan=delivery, item=po_item, quantity=40,
                                          tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER,
                                          delivery_date=FakeDate.build(2015, 03, 19))
        run_one = RunFactory(runnable=ip_node_one)
        quantity_received_qn = NumericQuestion.objects.get(label='amountReceived')
        NumericAnswerFactory(question=quantity_received_qn, value=39, run=run_one)

        last_shipment_date = FakeDate.build(2015, 10, 07)
        ip_node_two = DeliveryNodeFactory(distribution_plan=delivery, item=po_item, quantity=30,
                                          tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER,
                                          delivery_date=last_shipment_date)
        run_two = RunFactory(runnable=ip_node_two)
        NumericAnswerFactory(question=quantity_received_qn, value=40, run=run_two)

        expected_data = [
            {'document_number': purchase_order.order_number,
             'programme': programme.name,
             'last_shipment_date': str(last_shipment_date),
             'total_value_received': Decimal('79'),
             'total_value_dispensed': Decimal('0'),
             'balance': Decimal('79'),
             'items': [{'code': unicode(po_item.item.material_code),
                        'description': unicode(po_item.item.description),
                        'consignee': self.ip.name,
                        'location': ip_node_one.location,
                        'quantity_delivered': 3,
                        'date_delivered': str(self.ip_node_two.delivery_date),
                        'quantity_confirmed': 2,
                        'date_confirmed': '2014-01-02',
                        'quantity_dispatched': 2,
                        'balance': 0
                        },
                       {'code': unicode(po_item.item.material_code),
                        'description': unicode(po_item.item.description),
                        'consignee': self.ip.name,
                        'location': ip_node_two.location,
                        'quantity_delivered': 5,
                        'date_delivered': str(self.ip_node_one.delivery_date),
                        'quantity_confirmed': 4,
                        'date_confirmed': '2014-01-01',
                        'quantity_dispatched': 2,
                        'balance': 2
                        }]
             }]

        endpoint_url = BACKEND_URL + 'stock-report/'
        response = self.client.get(endpoint_url)

        self.assert_api_response_with_correct_last_shipment_date(response, expected_data)

    def test_should_return_paginated_response(self):
        self.add_a_node_with_response(5)

        endpoint_url = BACKEND_URL + 'stock-report?location=amuda'

        response = self.client.get(endpoint_url)
        self.assertEqual(len(response.data['results']), 5)
        self.assertEqual(response.data['previous'], None)
        self.assertEqual(response.data['next'], None)
        self.assertEqual(response.data['pageSize'], 10)
        self.assertEqual(response.data['count'], 5)

    def test_should_return_correct_paginated_response(self):
        self.add_a_node_with_response(17)

        endpoint_url = BACKEND_URL + 'stock-report?location=amuda'

        response = self.client.get(endpoint_url)
        self.assertEqual(len(response.data['results']), 10)
        self.assertEqual(response.data['previous'], None)
        self.assertEqual(response.data['next'], 'http://testserver/api/stock-report?location=amuda&page=2')
        self.assertEqual(response.data['pageSize'], 10)
        self.assertEqual(response.data['count'], 17)

    def add_a_node_with_response(self, number=1):
        delivery = DeliveryFactory(track=True)
        programme = ProgrammeFactory(name='special_program')
        sales_order = SalesOrderFactory(programme=programme)

        quantity_received_qn = NumericQuestion.objects.get(label='amountReceived')
        while number > 0:
            purchase_order = PurchaseOrderFactory(order_number=4748278 + number, sales_order=sales_order)
            po_item = PurchaseOrderItemFactory(purchase_order=purchase_order,
                                               item=ItemFactory(material_code='Code 23' + str(number),
                                                                description='Jerrycans' + str(number)))
            self.extra_ip_node = DeliveryNodeFactory(programme=delivery.programme, distribution_plan=delivery,
                                                     item=po_item,
                                                     quantity=40, acknowledged=40, balance=40, location='Amudat',
                                                     tree_position=DistributionPlanNode.IMPLEMENTING_PARTNER)
            run = RunFactory(runnable=self.extra_ip_node)

            NumericAnswerFactory(question=quantity_received_qn, value=40, run=run)
            number -= 1

        end_node_one = DeliveryNodeFactory(programme=delivery.programme,
                                           consignee=self.end_user,
                                           parents=[(self.extra_ip_node, 30)],
                                           tree_position=DistributionPlanNode.END_USER,
                                           item=po_item)
        run_end_node_one = RunFactory(runnable=end_node_one)

        NumericAnswerFactory(question=quantity_received_qn, value=43, run=run_end_node_one)

    def assert_api_response(self, response, expected_data):
        for stock in expected_data:
            stocks_in_response = filter(lambda stock_: stock_['document_number'] == stock['document_number'],
                                        response.data['results'])
            if len(stocks_in_response) > 0:
                stock_in_response = \
                    filter(lambda stock_: stock_['document_number'] == stock['document_number'],
                           response.data['results'])[0]
                for key in ['total_value_received', 'total_value_dispensed', 'balance']:
                    self.assertEquals(stock_in_response[key], stock[key])
                for item in stock['items']:
                    self.assertIn(item, stock_in_response['items'])

    def assert_api_response_with_programme_ip_location(self, response, expected_data):
        for stock in expected_data:
            stock_in_response = \
                filter(lambda stock_: stock_['document_number'] == stock['document_number']
                                      and stock_['programme'] == stock['programme'], response.data['results'])[0]

            for key in ['total_value_received', 'total_value_dispensed', 'balance']:
                self.assertEquals(stock_in_response[key], stock[key])

            for item in stock['items']:
                self.assertIn('consignee', item.keys())
                self.assertIn('location', item.keys())
                self.assertIn(item, stock_in_response['items'])

    def assert_api_response_with_correct_last_shipment_date(self, response, expected_data):
        for stock in expected_data:
            stock_in_response = \
                filter(lambda stock_: stock_['document_number'] == stock['document_number']
                                      and stock_['programme'] == stock['programme'], response.data['results'])[0]

            self.assertEqual(stock['last_shipment_date'], stock_in_response['last_shipment_date'])

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
                        'consignee': ip.name,
                        'location': end_node_one.location,
                        'quantity_delivered': 30,
                        'date_delivered': str(end_node_one.delivery_date),
                        'quantity_confirmed': 30,
                        'date_confirmed': '',
                        'quantity_dispatched': 20,
                        'balance': 10
                        },
                       {'code': unicode(po_item.item.material_code),
                        'description': unicode(po_item.item.description),
                        'consignee': ip.name,
                        'location': end_node_one.location,
                        'quantity_delivered': 40,
                        'date_delivered': str(end_node_one.delivery_date),
                        'quantity_confirmed': 40,
                        'date_confirmed': '',
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

        date_received_question.textanswer_set.create(value='2014-01-01', run=self.run_delivery_one)
        date_received_question.textanswer_set.create(value='2014-01-02', run=self.run_delivery_two)
        date_received_question.textanswer_set.create(value='2014-01-03', run=self.run_delivery_three)

    def setup_runs(self):
        self.run_one = RunFactory(runnable=self.ip_node_one)
        self.run_two = RunFactory(runnable=self.ip_node_two)
        self.run_three = RunFactory(runnable=self.ip_node_three)
        self.run_four = RunFactory(runnable=self.middle_man_node_one)
        self.run_five = RunFactory(runnable=self.middle_man_node_two)
        self.run_six = RunFactory(runnable=self.end_user_node)

        self.run_delivery_one = RunFactory(runnable=self.plan_one)
        self.run_delivery_two = RunFactory(runnable=self.plan_two)
        self.run_delivery_three = RunFactory(runnable=self.plan_three)

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
        self.programme_one = ProgrammeFactory(name='programme_one')
        self.programme_two = ProgrammeFactory(name='programme_two')
        so_one = SalesOrderFactory(programme=self.programme_one)
        so_two = SalesOrderFactory(programme=self.programme_two)

        so_item_one = SalesOrderItemFactory(sales_order=so_one, quantity=10, net_price=10, net_value=10 * 10)
        so_item_two = SalesOrderItemFactory(sales_order=so_one, quantity=5, net_price=10, net_value=5 * 10)
        so_item_three = SalesOrderItemFactory(sales_order=so_two, quantity=2, net_price=10, net_value=2 * 10)

        self.po_one = PurchaseOrderFactory(sales_order=so_one)
        self.po_two = PurchaseOrderFactory(sales_order=so_two)

        self.po_item_one = PurchaseOrderItemFactory(purchase_order=self.po_one, quantity=10,
                                                    sales_order_item=so_item_one, value=100)
        self.po_item_two = PurchaseOrderItemFactory(purchase_order=self.po_one, quantity=5,
                                                    sales_order_item=so_item_two, value=50)
        self.po_item_three = PurchaseOrderItemFactory(purchase_order=self.po_two, quantity=2,
                                                      sales_order_item=so_item_three, value=20)

    def setup_distribution_plans(self):
        self.plan_one = DeliveryFactory(programme=self.programme_one)
        self.plan_two = DeliveryFactory(programme=self.programme_one)
        self.plan_three = DeliveryFactory(programme=self.programme_two)
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
        TextQuestionFactory(label='dateOfReceipt', flow=self.ip_flow)
        NumericQuestionFactory(label='amountReceived', flow=self.ip_flow)

    def setup_flow(self):
        self.ip_flow = FlowFactory(for_runnable_type=Runnable.IMPLEMENTING_PARTNER)
