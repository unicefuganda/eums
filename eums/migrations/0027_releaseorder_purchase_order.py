# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0026_releaseorderitem_item_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='releaseorder',
            name='purchase_order',
            field=models.ForeignKey(to='eums.PurchaseOrder', null=True),
            preserve_default=True,
        ),
    ]
