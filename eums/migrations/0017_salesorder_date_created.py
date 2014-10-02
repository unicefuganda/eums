# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0016_salesorder'),
    ]

    operations = [
        migrations.AddField(
            model_name='salesorder',
            name='date_created',
            field=models.CharField(default=datetime.date(2014, 10, 2), max_length=255),
            preserve_default=False,
        ),
    ]
