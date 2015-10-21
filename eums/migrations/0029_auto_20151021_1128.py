# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0028_auto_20151008_1858'),
    ]

    operations = [
        migrations.AddField(
            model_name='runnable',
            name='created',
            field=models.DateTimeField(default=timezone.now(), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='runnable',
            name='modified',
            field=models.DateTimeField(default=timezone.now(), auto_now=True),
            preserve_default=False,
        ),
    ]
