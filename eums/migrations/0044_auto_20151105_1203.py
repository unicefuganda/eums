# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0043_default_existing_deliveries_total_value_to_zero'),
    ]

    operations = [
        migrations.AlterField(
            model_name='runnable',
            name='total_value',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
    ]
