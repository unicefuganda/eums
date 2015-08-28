# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0018_alert_item_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='alert',
            name='order_number',
            field=models.IntegerField(),
        ),
    ]
