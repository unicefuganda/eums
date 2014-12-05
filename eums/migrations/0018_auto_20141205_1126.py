# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0017_auto_20141205_1121'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='releaseorderitem',
            name='purchase_order',
        ),
        migrations.AddField(
            model_name='releaseorderitem',
            name='purchase_order_item',
            field=models.ForeignKey(default=0, to='eums.PurchaseOrderItem'),
            preserve_default=False,
        ),
    ]
