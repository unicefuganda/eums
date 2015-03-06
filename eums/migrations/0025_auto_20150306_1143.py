# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0024_auto_20150203_1404'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorderitem',
            name='quantity',
            field=models.DecimalField(null=True, max_digits=12, decimal_places=2),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='value',
            field=models.DecimalField(null=True, max_digits=12, decimal_places=2),
            preserve_default=True,
        ),
    ]
