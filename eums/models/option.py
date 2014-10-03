from django.db import models


class Option(models.Model):
    text = models.CharField(max_length=255)
