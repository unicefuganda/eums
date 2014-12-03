from django.contrib.auth.models import User
from django.db import models
from django_extensions.db.models import TimeStampedModel

class UserProfile(TimeStampedModel):
    user = models.OneToOneField(User, related_name="user_profile")
    consignee = models.ForeignKey("Consignee", blank=True, null=True)
