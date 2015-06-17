# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0032_auto_20150608_1336'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplannode',
            name='item',
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='purchase_order_item',
            field=models.ForeignKey(blank=True, to='eums.PurchaseOrderItem', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='release_order_item',
            field=models.ForeignKey(blank=True, to='eums.ReleaseOrderItem', null=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='releaseorder',
            name='purchase_order',
            field=models.ForeignKey(related_name=b'release_orders', to='eums.PurchaseOrder', null=True),
        ),
    ]
