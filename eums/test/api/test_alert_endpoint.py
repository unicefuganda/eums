from eums.models import ReleaseOrderItem
from eums.models.alert import Alert
from eums.test.api.authenticated_api_test_case import AuthenticatedAPITestCase
from eums.test.config import BACKEND_URL
from eums.test.factories.alert_factory import AlertFactory
from eums.test.factories.runnable_factory import RunnableFactory

ENDPOINT_URL = BACKEND_URL + 'alert/'


class AlertEndpointTest(AuthenticatedAPITestCase):

    def test_should_return_information_on_an_alert(self):
        runnable = RunnableFactory()
        AlertFactory(
            order_type=ReleaseOrderItem.WAYBILL,
            order_number=123456,
            issue=Alert.ISSUE_TYPES.not_received,
            is_resolved=False,
            remarks='some remarks',
            consignee_name='wakiso',
            contact_name='john doe',
            runnable=runnable,
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

        response = self.client.patch(ENDPOINT_URL, data={'id': alert.id, 'remarks': 'some remarks'})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(updated_alert.remarks, 'some remarks')
        self.assertEqual(updated_alert.is_resolved, True)

    def test_should_not_update_alert_when_remark_does_not_exist(self):
        alert = AlertFactory()

        response = self.client.patch(ENDPOINT_URL, data={'id': alert.id, 'alert_remarks': 'some remarks'})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(updated_alert.remarks, None)
        self.assertEqual(updated_alert.is_resolved, False)

    def test_should_not_update_alert_when_remark_is_blank(self):
        alert = AlertFactory()

        response = self.client.patch(ENDPOINT_URL, data={'id': alert.id, 'remarks': ''})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(updated_alert.remarks, None)
        self.assertEqual(updated_alert.is_resolved, False)

    def test_should_not_update_alert_when_id_does_not_exist(self):
        alert = AlertFactory()

        response = self.client.patch(ENDPOINT_URL, data={'alert_id': alert.id, 'alert_remarks': 'some remarks'})
        updated_alert = Alert.objects.get(pk=alert.id)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(updated_alert.remarks, None)
        self.assertEqual(updated_alert.is_resolved, False)


class AlertCountEndpointTest(AuthenticatedAPITestCase):

    def test_should_show_alerts_count(self):
        AlertFactory(is_resolved=False)
        AlertFactory(is_resolved=True)

        response = self.client.get(ENDPOINT_URL + "count/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['unresolved'], 1)
