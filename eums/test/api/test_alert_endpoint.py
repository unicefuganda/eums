from eums.models import ReleaseOrderItem, Flow, Runnable, Question
from eums.models.alert import Alert
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.answer_factory import TextAnswerFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from eums.test.factories.flow_factory import FlowFactory
from eums.test.factories.question_factory import TextQuestionFactory
from eums.test.factories.run_factory import RunFactory

ENDPOINT_URL = BACKEND_URL + 'alert/'


class AlertEndpointTest(AuthenticatedAPITestCase):
    def setUp(self):
        self.flow_ip = FlowFactory(rapid_pro_id=12345, label=Flow.Label.IMPLEMENTING_PARTNER)
        FlowFactory(rapid_pro_id=1234, label=Flow.Label.END_USER)
        FlowFactory(rapid_pro_id=1236, label=Flow.Label.MIDDLE_MAN)
        super(AlertEndpointTest, self).setUp()

    def test_should_return_information_on_an_alert(self):
        AlertFactory(
            order_type=ReleaseOrderItem.WAYBILL,
            order_number=123456,
            issue=Alert.ISSUE_TYPES.not_received,
            is_resolved=False,
            remarks='some remarks',
            consignee_name='wakiso',
            contact_name='john doe',
            item_description="some description")

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        first_alert = response.data[0]
        self.assertIsNotNone(first_alert['id'])
        self.assertEqual(first_alert['order_type'], ReleaseOrderItem.WAYBILL)
        self.assertEqual(first_alert['order_number'], 123456)
        self.assertEqual(first_alert['issue'], Alert.ISSUE_TYPES.not_received)
        self.assertEqual(first_alert['is_resolved'], False)
        self.assertEqual(first_alert['remarks'], 'some remarks')
        self.assertEqual(first_alert['consignee_name'], 'wakiso')
        self.assertEqual(first_alert['contact_name'], 'john doe')
        self.assertEqual(first_alert['item_description'], 'some description')
        self.assertEqual(first_alert['issue_display_name'], Alert.ISSUE_TYPES[Alert.ISSUE_TYPES.not_received])

    def test_should_return_multiple_alerts_when_multiple_exist(self):
        AlertFactory()
        AlertFactory()
        AlertFactory()

        response = self.client.get(ENDPOINT_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

    def test_should_paginate_alert_list_on_request(self):
        AlertFactory()
        AlertFactory()
        response = self.client.get('%s?paginate=true' % ENDPOINT_URL)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertIn('pageSize', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_should_not_paginate_alert_list_when_paginate_is_not_true(self):
        response = self.client.get('%s?paginate=falsy' % ENDPOINT_URL)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('results', response.data)
        self.assertEqual(response.data, [])

    def test_should_update_alert(self):
        alert = AlertFactory()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, alert.id), data={'remarks': 'some remarks'})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(updated_alert.remarks, 'some remarks')
        self.assertEqual(updated_alert.is_resolved, True)

    def test_should_not_update_alert_when_remark_does_not_exist(self):
        alert = AlertFactory()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, alert.id),
                                     data={'id': alert.id, 'alert_remarks': 'some remarks'})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(updated_alert.remarks, None)
        self.assertEqual(updated_alert.is_resolved, False)

    def test_should_not_update_alert_when_remark_is_blank(self):
        alert = AlertFactory()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, alert.id), data={'remarks': ''})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(updated_alert.remarks, None)
        self.assertEqual(updated_alert.is_resolved, False)

    def test_should_not_update_alert_when_id_does_not_exist(self):
        alert = AlertFactory()

        response = self.client.patch('%s%s/' % (ENDPOINT_URL, alert.id), data={'alert_remarks': 'some remarks'})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(updated_alert.remarks, None)
        self.assertEqual(updated_alert.is_resolved, False)

    def test_should_filter_alerts_by_runnable_type_when_item(self):
        item_alert = AlertFactory(runnable=DeliveryNodeFactory())
        item_alert_ids, item_alerts = self.__respond_by_alert_type('item')
        self.assertEqual(Alert.objects.count(), 1)
        self.assertEqual(len(item_alerts), 1)
        self.assertIn(item_alert.id, item_alert_ids)

    def test_should_filter_alerts_by_runnable_type_when_delivery(self):
        delivery_alert = AlertFactory(runnable=DeliveryFactory())
        delivery_alert_ids, delivery_alerts = self.__respond_by_alert_type('delivery')
        self.assertEqual(Alert.objects.count(), 1)
        self.assertEqual(len(delivery_alerts), 1)
        self.assertIn(delivery_alert.id, delivery_alert_ids)

    def test_should_filter_alerts_by_runnable_type_when_distribution(self):
        delivery = DeliveryFactory(time_limitation_on_distribution=3)
        question_received_date = TextQuestionFactory(label=Question.LABEL.dateOfReceipt, flow=self.flow_ip)
        run = RunFactory(runnable=delivery)
        DeliveryNodeFactory(distribution_plan=delivery, tree_position=Flow.Label.IMPLEMENTING_PARTNER)
        received_date = '2015-11-20T16:00:00'
        TextAnswerFactory(run=run, question=question_received_date, value=received_date)

        distribution_alert = AlertFactory(runnable=delivery, issue=Alert.ISSUE_TYPES.distribution_expired)
        distribution_alert_ids, distribution_alerts = self.__respond_by_alert_type('distribution')

        self.assertEqual(Alert.objects.count(), 1)
        self.assertTrue(distribution_alerts[0]['date_received'])
        self.assertEqual(distribution_alerts[0]['date_received'], received_date)
        self.assertEqual(len(distribution_alerts), 1)
        self.assertIn(distribution_alert.id, distribution_alert_ids)

    def __respond_by_alert_type(self, alert_type):
        alerts_response = self.client.get('%s?type=%s' % (ENDPOINT_URL, alert_type))
        alerts = alerts_response.data
        alert_ids = [alert['id'] for alert in alerts]
        return alert_ids, alerts


class AlertCountEndpointTest(AuthenticatedAPITestCase):
    def test_should_show_alerts_count(self):
        AlertFactory(is_resolved=False)
        AlertFactory(is_resolved=True)

        response = self.client.get(ENDPOINT_URL + "count/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['unresolved'], 1)
