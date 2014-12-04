# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0014_auto_20141204_1656'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salesorder',
            name='order_number',
            field=models.IntegerField(unique=True),
        ),
    ]
