# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0009_auto_20160106_1831'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='additional_remarks',
            field=models.TextField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
