# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0010_auto_20140918_0946'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplan',
            name='name',
            field=models.CharField(default='Plan 1', max_length=255),
            preserve_default=False,
        ),
    ]
