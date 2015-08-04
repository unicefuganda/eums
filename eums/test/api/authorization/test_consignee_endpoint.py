from eums.test.api.authorization.permissions_test_case import PermissionsTestCase
from eums.test.factories.delivery_node_factory import DeliveryNodeFactory
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from eums.models import Consignee, DistributionPlan, UserProfile
from eums.test.factories.consignee_factory import ConsigneeFactory
from eums.test.config import BACKEND_URL


ENDPOINT_URL = BACKEND_URL + 'consignee/'


class ConsigneeEndpointTest(PermissionsTestCase):
    def tearDown(self):
        UserProfile.objects.all().delete()
        User.objects.all().delete()
        Consignee.objects.all().delete()
        DistributionPlan.objects.all().delete()

    def test_should_allow_superuser_to_delete_consignee(self):
        consignee = ConsigneeFactory(name='Some Consignee')
        User.objects.create_superuser(username='admin', email='some@email.com', password='admin')

        self.client.login(username='admin', password='admin')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 204)

    def test_should_save_the_user_who_creates_the_consignee(self):
        user = User.objects.create_user(username='created_by_test', email='admin@email.com', password='pass')
        user.groups = [Group.objects.get(name="UNICEF_admin")]
        user.save()

        self.client.login(username='created_by_test', password='pass')
        response = self.client.post(ENDPOINT_URL, {'name': 'Created By Test Consignee'})

        self.assertEqual(response.status_code, 201)
        consignee = Consignee.objects.get(name='Created By Test Consignee')
        self.assertEqual(consignee.created_by_user, user)

    # UNICEF Admins

    def test_should_give_unicef_user_permission_to_edit_non_vision_consignee(self):
        consignee = ConsigneeFactory(imported_from_vision=False)

        self._login_as('UNICEF_admin')
        response = self.client.get(ENDPOINT_URL + str(consignee.id) + '/permission_to_edit/')

        self.assertEqual(response.status_code, 200)

    def test_should_not_give_unicef_user_permission_to_edit_when_vision_consignee(self):
        consignee = ConsigneeFactory(imported_from_vision=True)

        self._login_as('UNICEF_admin')
        response = self.client.get(ENDPOINT_URL + str(consignee.id) + '/permission_to_edit/')

        self.assertEqual(response.status_code, 403)    

    def test_should_allow_unicef_admin_to_add_consignee(self):
        self._login_as('UNICEF_admin')
        response = self.client.post(ENDPOINT_URL, {'name': 'Some Consignee Name'})

        self.assertEqual(response.status_code, 201)

    def test_should_allow_unicef_admin_to_change_consignee(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False)

        self._login_as('UNICEF_admin')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/', {'name': 'Updated Consignee'})

        self.assertEqual(response.status_code, 200)
        updated_name = Consignee.objects.get(id=consignee.id).name
        self.assertEqual(updated_name, 'Updated Consignee')

    def test_should_not_allow_unicef_admin_to_change_consignee_name_when_vision_imported(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=True)

        self._login_as('UNICEF_admin')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/', {'name': 'Updated Consignee'})

        self.assertEqual(response.status_code, 403)

    def test_should_allow_unicef_admin_to_change_consignee_remarks_when_vision_imported(self):
        consignee = ConsigneeFactory(name='New Consignee', remarks='New Remark', imported_from_vision=True)

        self._login_as('UNICEF_admin')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/',
                                   {'name': 'New Consignee', 'remarks': 'Changed Remark'})

        self.assertEqual(response.status_code, 200)
        db_consignee = Consignee.objects.get(id=consignee.id)
        self.assertEqual(db_consignee.remarks, 'Changed Remark')

    def test_should_disallow_unicef_admin_to_change_consignee_that_is_attached_to_delivery(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False)
        DeliveryNodeFactory(consignee=consignee)

        self._login_as('UNICEF_admin')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/', {'name': 'Updated Consignee'})

        self.assertEqual(response.status_code, 403)

    def test_should_allow_unicef_admin_to_change_remarks_for_consignee_attached_to_delivery(self):
        consignee = ConsigneeFactory(name='New Consignee', remarks='New Remark', imported_from_vision=True)
        DeliveryNodeFactory(consignee=consignee)

        self._login_as('UNICEF_admin')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/',
                                   {'name': 'New Consignee', 'remarks': 'Some New Remark'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Consignee.objects.get(id=consignee.id).remarks, 'Some New Remark')

    def test_should_allow_unicef_admin_to_delete_consignee_that_is_not_vision_imported(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False)

        self._login_as('UNICEF_admin')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Consignee.objects.count(), 0)

    def test_should_disallow_unicef_admin_to_delete_consignee_that_is_vision_imported(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=True)

        self._login_as('UNICEF_admin')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Consignee.objects.count(), 1)

    def test_should_disallow_unicef_admin_to_delete_consignee_that_is_attached_to_delivery(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False)
        DeliveryNodeFactory(consignee=consignee)

        self._login_as('UNICEF_admin')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Consignee.objects.filter(name='New Consignee').count(), 1)

    def test_should_allow_unicef_admin_to_delete_consignees_without_a_user(self):
        consignee = ConsigneeFactory(name='New Consignee', created_by_user=None, imported_from_vision=False)

        self._login_as('UNICEF_admin')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Consignee.objects.count(), 0)

    # UNICEF Editors

    def test_should_allow_unicef_editor_to_add_consignee(self):
        self._login_as('UNICEF_editor')
        response = self.client.post(ENDPOINT_URL, {'name': 'Some Consignee Name'})

        self.assertEqual(response.status_code, 201)

    def test_should_allow_unicef_editor_to_change_consignee(self):
        consignee = ConsigneeFactory(name='New Consignee')

        self._login_as('UNICEF_editor')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/', {'name': 'Updated Consignee'})

        self.assertEqual(response.status_code, 200)
        updated_name = Consignee.objects.get(id=consignee.id).name
        self.assertEqual(updated_name, 'Updated Consignee')

    def test_should_allow_unicef_editor_to_delete_consignee_that_is_not_vision_imported(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False)

        self._login_as('UNICEF_editor')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Consignee.objects.count(), 0)

    def test_should_disallow_unicef_editor_to_delete_consignee_that_is_vision_imported(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=True)

        self._login_as('UNICEF_editor')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Consignee.objects.count(), 1)

    # UNICEF Viewers

    def test_should_disallow_unicef_viewer_to_add_consignee(self):
        self._login_as('UNICEF_viewer')
        response = self.client.post(ENDPOINT_URL, {'name': 'Some Consignee Name'})

        self.assertEqual(response.status_code, 403)

    def test_should_disallow_unicef_viewer_to_change_consignee(self):
        consignee = ConsigneeFactory(name='New Consignee')

        self._login_as('UNICEF_viewer')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/', {'name': 'Updated Consignee'})

        self.assertEqual(response.status_code, 403)

    def test_should_disallow_unicef_viewer_to_delete_consignee(self):
        consignee = ConsigneeFactory(name='New Consignee')

        self._login_as('UNICEF_viewer')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 403)

    # IP Editors

    def test_should_not_give_ip_user_permission_to_fully_edit_consignee_created_by_other(self):
        profile_consignee_one = ConsigneeFactory(name='Consignee 1')
        profile_consignee_two = ConsigneeFactory(name='Consignee 2')

        user_one = User.objects.create_user(username='user_name_one', password='pass')
        user_profile_one = UserProfile(user=user_one, consignee=profile_consignee_one)
        user_profile_one.save()
        user_one.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_one.save()

        user_two = User.objects.create_user(username='user_name_two', password='pass')
        user_profile_two = UserProfile(user=user_two, consignee=profile_consignee_two)
        user_profile_two.save()
        user_two.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_two.save()

        consignee_to_check = ConsigneeFactory(
            name='Original Name', 
            imported_from_vision=False,
            created_by_user=user_two)
        self.client.login(username='user_name_one', password='pass')
        response = self.client.get(ENDPOINT_URL + str(consignee_to_check.id) + '/permission_to_edit/')

        self.assertEqual(response.status_code, 403)

    def test_should_give_ip_user_permission_to_fully_edit_consignee_created_by_same_ip(self):
        profile_consignee_one = ConsigneeFactory(name='Consignee 1')

        user_one = User.objects.create_user(username='user_name_one', password='pass')
        user_profile_one = UserProfile(user=user_one, consignee=profile_consignee_one)
        user_profile_one.save()
        user_one.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_one.save()

        user_two = User.objects.create_user(username='user_name_two', password='pass')
        user_profile_two = UserProfile(user=user_two, consignee=profile_consignee_one)
        user_profile_two.save()
        user_two.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_two.save()

        consignee_to_check = ConsigneeFactory(
            name='Original Name', 
            imported_from_vision=False,
            created_by_user=user_two)
        self.client.login(username='user_name_one', password='pass')
        response = self.client.get(ENDPOINT_URL + str(consignee_to_check.id) + '/permission_to_edit/')

        self.assertEqual(response.status_code, 200)            

    def test_should_allow_ip_editor_to_add_consignee(self):
        self._login_as('Implementing Partner_editor')
        response = self.client.post(ENDPOINT_URL, {'name': 'Some Consignee Name'})

        self.assertEqual(response.status_code, 201)

    def test_should_allow_ip_editor_to_change_consignee_if_created_by_them(self):
        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False)

        user = User.objects.create_user(username='user_name_one', password='pass')
        user_profile = UserProfile(user=user, consignee=consignee)
        user_profile.save()
        user.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user.save()

        consignee_to_update = ConsigneeFactory(
            name='Original Name', 
            imported_from_vision=False,
            created_by_user=user)
        self.client.login(username='user_name_one', password='pass')
        response = self.client.put(ENDPOINT_URL + str(consignee_to_update.id) + '/', {'name': 'New Name'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Consignee.objects.filter(name='Original Name').count(), 0)
        self.assertEqual(Consignee.objects.filter(name='New Name').count(), 1)

    def test_should_allow_ip_editor_to_change_consignee_only_if_created_within_same_ip(self):
        user_consignee = ConsigneeFactory(name='Created Consignee')

        user_one = User.objects.create_user(username='user_name_one', password='pass')
        user_profile = UserProfile(user=user_one, consignee=user_consignee)
        user_profile.save()
        user_one.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_one.save()

        user_two = User.objects.create_user(username='user_name_two', password='pass')
        user_profile = UserProfile(user=user_two, consignee=user_consignee)
        user_profile.save()
        user_two.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_two.save()

        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False, created_by_user=user_one)
        self.client.login(username='user_name_two', password='pass')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/', {'name': 'Updated Consignee'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Consignee.objects.filter(name='New Consignee').count(), 0)
        self.assertEqual(Consignee.objects.filter(name='Updated Consignee').count(), 1)

    def test_should_not_allow_ip_editor_to_change_consignee_only_if_consignee_created_by_another_ip(self):
        profile_consignee_one = ConsigneeFactory(name='Consignee 1')
        profile_consignee_two = ConsigneeFactory(name='Consignee 2')

        user_one = User.objects.create_user(username='user_name_one', password='pass')
        user_profile_one = UserProfile(user=user_one, consignee=profile_consignee_one)
        user_profile_one.save()
        user_one.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_one.save()

        user_two = User.objects.create_user(username='user_name_two', password='pass')
        user_profile_two = UserProfile(user=user_two, consignee=profile_consignee_two)
        user_profile_two.save()
        user_two.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_two.save()

        user_two_created_consignee = ConsigneeFactory(
            name='Another New Consignee', 
            imported_from_vision=False, 
            created_by_user=user_two)
        self.client.login(username='user_name_one', password='pass')
        response = self.client.put(
            ENDPOINT_URL + str(user_two_created_consignee.id) + '/', 
            {'name': 'Updated New Consignee'})

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Consignee.objects.filter(name='Another New Consignee').count(), 1)
        self.assertEqual(Consignee.objects.filter(name='Updated New Consignee').count(), 0)

    def test_should_allow_ip_editor_to_change_consignee_remarks_even_if_created_by_another(self):
        profile_consignee_one = ConsigneeFactory(name='Consignee 1')
        profile_consignee_two = ConsigneeFactory(name='Consignee 2')

        user_one = User.objects.create_user(username='user_name_one', password='pass')
        user_profile_one = UserProfile(user=user_one, consignee=profile_consignee_one)
        user_profile_one.save()
        user_one.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_one.save()

        user_two = User.objects.create_user(username='user_name_two', password='pass')
        user_profile_two = UserProfile(user=user_two, consignee=profile_consignee_two)
        user_profile_two.save()
        user_two.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_two.save()

        user_two_created_consignee = ConsigneeFactory(
            name='Some Consignee',
            remarks='Original Remark',
            imported_from_vision=False, 
            created_by_user=user_two)
        self.client.login(username='user_name_one', password='pass')
        response = self.client.put(
            ENDPOINT_URL + str(user_two_created_consignee.id) + '/', 
            {'name': 'Some Consignee', 'remarks': 'Updated Remark'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Consignee.objects.get(name='Some Consignee').remarks, 'Updated Remark')

    def test_should_allow_ip_editor_to_delete_consignee_that_is_not_vision_imported_and_created_by_same_user(self):
        user = User.objects.create_user(username='some_user_name', password='pass')
        consignee = ConsigneeFactory(name="User Attached Consignee")
        profile = UserProfile(user=user, consignee=consignee)
        profile.save()
        user.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user.save()

        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False, created_by_user=user)
        self.client.login(username='some_user_name', password='pass')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Consignee.objects.filter(name='New Consignee').count(), 0)

    def test_should_allow_ip_editor_to_delete_consignee_that_are_not_created_by_them_but_same_consignee(self):
        user_consignee = ConsigneeFactory(name='Created Consignee')

        user_one = User.objects.create_user(username='user_name_one', password='pass')
        user_profile = UserProfile(user=user_one, consignee=user_consignee)
        user_profile.save()
        user_one.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_one.save()

        user_two = User.objects.create_user(username='user_name_two', password='pass')
        user_profile = UserProfile(user=user_two, consignee=user_consignee)
        user_profile.save()
        user_two.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user_two.save()

        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=False, created_by_user=user_one)
        self.client.login(username='user_name_two', password='pass')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Consignee.objects.filter(name='New Consignee').count(), 0)

    def test_should_disallow_ip_editor_to_delete_consignee_that_is_vision_imported(self):
        user = User.objects.create_user(username='some_user_name', password='pass')
        consignee = ConsigneeFactory(name="User Attached Consignee")
        profile = UserProfile(user=user, consignee=consignee)
        profile.save()
        user.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user.save()

        consignee = ConsigneeFactory(name='New Consignee', imported_from_vision=True)
        self.client.login(username='some_user_name', password='pass')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Consignee.objects.filter(name='New Consignee').count(), 1)

    def test_should_disallow_ip_editor_from_deleting_consignee_created_by_another_role(self):
        user = User.objects.create_user(username='user_one', password='pass')
        attached_consignee = ConsigneeFactory(name='User Attached Consignee', created_by_user=user, imported_from_vision=False)
        profile = UserProfile(user=user, consignee=attached_consignee)
        profile.save()
        user.groups = [Group.objects.get(name='Implementing Partner_editor')]
        user.save()

        user_two = User.objects.create_user(username='user_two', password='pass')
        user_two.groups = [Group.objects.get(name='UNICEF_admin')]
        user_two.save()

        consignee = ConsigneeFactory(name='New Consignee', created_by_user=user_two, imported_from_vision=False)
        self.client.login(username='user_one', password='pass')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 403)

    # IP Viewers

    def test_should_disallow_ip_viewer_to_add_consignee(self):
        self._login_as('Implementing Partner_viewer')
        response = self.client.post(ENDPOINT_URL, {'name': 'Some Consignee Name'})

        self.assertEqual(response.status_code, 403)

    def test_should_disallow_ip_viewer_to_change_consignee(self):
        consignee = ConsigneeFactory(name='New Consignee')

        self._login_as('Implementing Partner_viewer')
        response = self.client.put(ENDPOINT_URL + str(consignee.id) + '/', {'name': 'Updated Consignee'})

        self.assertEqual(response.status_code, 403)

    def test_should_disallow_ip_viewer_to_delete_consignee(self):
        consignee = ConsigneeFactory(name='New Consignee')

        self._login_as('Implementing Partner_viewer')
        response = self.client.delete(ENDPOINT_URL + str(consignee.id) + '/')

        self.assertEqual(response.status_code, 403)

    # Helper methods

    def _login_as(self, group_name):
        self._associate_group_with_user(group_name, 'some_user_name', 'pass')
        self.client.login(username='some_user_name', password='pass')

    def _associate_group_with_user(self, group_name, username, password):
        user = User.objects.create_user(username=username, email='user@email.com', password=password)
        user.groups = [Group.objects.get(name=group_name)]
        user.save()
