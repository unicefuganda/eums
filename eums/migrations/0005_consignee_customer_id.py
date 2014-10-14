# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0004_releaseorder_releaseorderitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='consignee',
            name='customer_id',
            field=models.CharField(default='default', max_length=255),
            preserve_default=False,
        ),
    ]
