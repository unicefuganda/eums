from django.db import models
from eums.models import Programme


class SalesOrder(models.Model):
    programme = models.ForeignKey(Programme)
    order_number = models.CharField(max_length=255)
    date = models.DateField(auto_now=False)
    description = models.CharField(max_length=255, null=True)

    class Meta:
        app_label = 'eums'