# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0022_auto_20141003_1536'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='uuid',
        ),
        migrations.AddField(
            model_name='question',
            name='label',
            field=models.CharField(default='default label', unique=True, max_length=255),
            preserve_default=False,
        ),
    ]
