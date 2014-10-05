# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0022_salesorderitem_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='salesorder',
            name='date',
            field=models.DateField(default=datetime.date(2014, 10, 5)),
            preserve_default=False,
        ),
    ]
