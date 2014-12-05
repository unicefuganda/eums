# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0016_auto_20141205_1104'),
    ]

    operations = [
        migrations.AlterField(
            model_name='releaseorder',
            name='order_number',
            field=models.IntegerField(unique=True),
        ),
        migrations.AlterField(
            model_name='releaseorder',
            name='waybill',
            field=models.IntegerField(),
        ),
    ]
