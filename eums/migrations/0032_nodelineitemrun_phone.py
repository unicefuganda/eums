# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0031_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='nodelineitemrun',
            name='phone',
            field=models.CharField(default='0123', max_length=255),
            preserve_default=False,
        ),
    ]
