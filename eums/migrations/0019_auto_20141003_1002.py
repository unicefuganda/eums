# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0018_auto_20141002_1529'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='salesorder',
            name='delivery_date',
        ),
        migrations.RemoveField(
            model_name='salesorder',
            name='issue_date',
        ),
        migrations.RemoveField(
            model_name='salesorder',
            name='item',
        ),
        migrations.RemoveField(
            model_name='salesorder',
            name='net_price',
        ),
        migrations.RemoveField(
            model_name='salesorder',
            name='net_value',
        ),
        migrations.RemoveField(
            model_name='salesorder',
            name='quantity',
        ),
    ]
