from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.factories.delivery_factory import DeliveryFactory
from eums.test.factories.programme_factory import ProgrammeFactory
from rest_framework.test import APITestCase
from django.core.management import call_command
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from eums.models import Consignee, DistributionPlan, UserProfile
from eums.test.config import BACKEND_URL

ENDPOINT_URL = BACKEND_URL + 'distribution-plan/'


class DeliveryEndpointTest(APITestCase):
    def setUp(self):
        call_command('setup_permissions')

    def tearDown(self):
        UserProfile.objects.all().delete()
        User.objects.all().delete()
        Consignee.objects.all().delete()
        DistributionPlan.objects.all().delete()

    # UNICEF Admin

    def test_should_allow_unicef_admin_to_create_deliveries(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        self._login_as('UNICEF_admin')

        response = self.client.post(ENDPOINT_URL, {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id'
        })

        self.assertEqual(response.status_code, 201)

    def test_should_allow_unicef_admin_to_view_deliveries(self):
        delivery = DeliveryFactory()
        self._login_as('UNICEF_admin')

        response = self.client.get(ENDPOINT_URL + str(delivery.id) + '/')

        self.assertEqual(response.status_code, 200)

    def test_should_allow_unicef_admin_to_track_delivery(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        delivery = DeliveryFactory(programme=programme, consignee=consignee, location='Kampala',
                                   delivery_date='2015-12-12')
        self._login_as('UNICEF_admin')

        response = self.client.put(ENDPOINT_URL + str(delivery.id) + '/', {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id',
            'track': 'true'
        })

        self.assertEqual(response.status_code, 200)

    # UNICEF Editor:
    def test_should_allow_unicef_editor_to_create_deliveries(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        self._login_as('UNICEF_editor')

        response = self.client.post(ENDPOINT_URL, {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id'
        })

        self.assertEqual(response.status_code, 201)

    def test_should_allow_unicef_editor_to_view_deliveries(self):
        delivery = DeliveryFactory()
        self._login_as('UNICEF_editor')

        response = self.client.get(ENDPOINT_URL + str(delivery.id) + '/')

        self.assertEqual(response.status_code, 200)

    def test_should_allow_unicef_editor_to_track_delivery(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        delivery = DeliveryFactory(programme=programme, consignee=consignee, location='Kampala',
                                           delivery_date='2015-12-12')

        self._login_as('UNICEF_editor')

        response = self.client.put(ENDPOINT_URL + str(delivery.id) + '/', {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id',
            'track': 'true'
        })

        self.assertEqual(response.status_code, 200)

    # UNICEF Viewer:
    def test_should_not_allow_unicef_viewer_to_create_deliveries(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        self._login_as('UNICEF_viewer')

        response = self.client.post(ENDPOINT_URL, {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id'
        })

        self.assertEqual(response.status_code, 403)

    def test_should_allow_unicef_viewer_to_view_deliveries(self):
        delivery = DeliveryFactory()
        self._login_as('UNICEF_viewer')

        response = self.client.get(ENDPOINT_URL + str(delivery.id) + '/')

        self.assertEqual(response.status_code, 200)

    def test_should_not_allow_unicef_viewer_to_track_delivery(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        delivery = DeliveryFactory(programme=programme, consignee=consignee, location='Kampala',
                                   delivery_date='2015-12-12')
        self._login_as('UNICEF_viewer')

        response = self.client.put(ENDPOINT_URL + str(delivery.id) + '/', {'id': str(delivery.id), 'track': 'true'})

        self.assertEqual(response.status_code, 403)

    # Implementing partner editor:
    def test_should_not_allow_implementing_partner_editors_to_create_deliveries(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        self._login_as('Implementing Partner_editor')

        response = self.client.post(ENDPOINT_URL, {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id'
        })

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_editors_to_view_deliveries(self):
        delivery = DeliveryFactory()
        self._login_as('Implementing Partner_editor')

        response = self.client.get(ENDPOINT_URL + str(delivery.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_editors_to_track_delivery(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        self._login_as('Implementing Partner_editor')

        response = self.client.put(ENDPOINT_URL, {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id',
            'track': 'true'
        })

        self.assertEqual(response.status_code, 403)

    # Implementing partner viewer:
    def test_should_not_allow_implementing_partner_viewers_to_create_deliveries(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        self._login_as('Implementing Partner_viewer')

        response = self.client.post(ENDPOINT_URL, {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id'
        })

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_viewers_to_view_deliveries(self):
        delivery = DeliveryFactory()
        self._login_as('Implementing Partner_viewer')

        response = self.client.get(ENDPOINT_URL + str(delivery.id) + '/')

        self.assertEqual(response.status_code, 403)

    def test_should_not_allow_implementing_partner_viewers_to_track_delivery(self):
        programme = ProgrammeFactory()
        consignee = ConsigneeFactory()
        self._login_as('Implementing Partner_viewer')

        response = self.client.put(ENDPOINT_URL, {
            'programme': str(programme.id),
            'consignee': str(consignee.id),
            'location': 'Kampala',
            'delivery_date': '2015-12-12',
            'contact_person_id': 'some_id',
            'track': 'true'
        })

        self.assertEqual(response.status_code, 403)

    # Helper methods

    def _login_as(self, group_name):
        self._associate_group_with_user(group_name, 'some_user_name', 'pass')
        self.client.login(username='some_user_name', password='pass')

    def _associate_group_with_user(self, group_name, username, password):
        user = User.objects.create_user(username=username, email='user@email.com', password=password)
        user.groups = [Group.objects.get(name=group_name)]
        user.save()
