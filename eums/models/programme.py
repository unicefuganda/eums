from django.contrib.auth.models import User
from django.db import models


class Programme(models.Model):
    name = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'

    def __str__(self):
        return self.name
