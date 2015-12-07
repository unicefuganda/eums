# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0057_distributionplan_last_shipment_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='distributionplan',
            name='last_shipment_date',
            field=models.DateField(null=True),
        ),
    ]
