# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0060_auto_20151208_0905'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplan',
            name='last_shipment_date',
        ),
    ]
