# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0002_auto_20150808_1349'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='label',
            field=models.CharField(max_length=255),
        ),
    ]
