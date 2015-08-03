from django.core.management import call_command
from eums.auth import create_groups, create_permissions
from rest_framework.test import APITestCase


class PermissionsTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        create_groups()
        create_permissions()
        call_command('setup_permissions')
