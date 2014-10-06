# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0025_salesorder_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplan',
            name='date',
            field=models.DateField(default=datetime.date(2014, 10, 4), auto_now=True),
            preserve_default=False,
        ),
    ]
