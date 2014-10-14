# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0005_consignee_customer_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='releaseorder',
            name='waybill',
            field=models.CharField(default='default', max_length=100),
            preserve_default=False,
        ),
    ]
