# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0058_auto_20151207_1927'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='shipment_date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
    ]
