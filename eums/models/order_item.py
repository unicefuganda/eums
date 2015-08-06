from django.db import models
from polymorphic import PolymorphicModel


class OrderItem(PolymorphicModel):
    item = models.ForeignKey('Item')
    item_number = models.IntegerField(default=0, null=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True)

