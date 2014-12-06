# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0020_auto_20141205_1652'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='purchaseorderitem',
            unique_together=set([('purchase_order', 'item_number', 'sales_order_item')]),
        ),
    ]
