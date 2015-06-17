# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations

from eums.models import PurchaseOrderItem


def link_purchase_order_items_to_correct_items(apps, schema_editor):
    for purchase_order_item in PurchaseOrderItem.objects.all():
        purchase_order_item.item = purchase_order_item.sales_order_item.item
        purchase_order_item.save()


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0034_purchaseorderitem_item'),
    ]

    operations = [migrations.RunPython(link_purchase_order_items_to_correct_items, lambda x, y: None)]
