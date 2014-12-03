from django.contrib.auth.models import User
from unittest import TestCase

from eums.models.users import UserProfile


class UserProfileTest(TestCase):
    def test_user_fields(self):
        user_profile = UserProfile()
        fields = [str(item.attname) for item in user_profile._meta.fields]
        self.assertEqual(5, len(fields))
        for field in ['id', 'created', 'modified', 'user_id', 'consignee_id']:
            self.assertIn(field, fields)

    def test_profile_associated_with_user(self):
        user = User.objects.create()
        user_profile = UserProfile.objects.create(user=user)
        self.failUnless(user_profile.id)
        self.assertEqual(user, user_profile.user)