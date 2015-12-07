# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0056_auto_20151203_1104'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplan',
            name='last_shipment_date',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
    ]
