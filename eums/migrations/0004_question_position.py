# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_auto_20150808_1639'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='position',
            field=models.IntegerField(default=1),
            preserve_default=True,
        ),
    ]
