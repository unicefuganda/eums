# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0010_alert'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='alert',
            name='created_at',
        ),
        migrations.AddField(
            model_name='alert',
            name='created_on',
            field=models.DateField(auto_now_add=True)
        ),
    ]
