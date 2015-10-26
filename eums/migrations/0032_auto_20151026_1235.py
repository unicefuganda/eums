# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.utils import timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0031_syncinfo'),
    ]

    operations = [
        migrations.AddField(
            model_name='option',
            name='created',
            field=models.DateTimeField(default=timezone.now(), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='option',
            name='modified',
            field=models.DateTimeField(default=timezone.now(), auto_now=True),
            preserve_default=False,
        )
    ]
