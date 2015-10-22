from django.db import models
from polymorphic import PolymorphicModel
from eums.models.time_stamped_model import TimeStampedModel


class OrderItem(PolymorphicModel, TimeStampedModel):
    item = models.ForeignKey('Item')
    item_number = models.IntegerField(default=0, null=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True)

