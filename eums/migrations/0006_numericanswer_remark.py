# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0005_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='numericanswer',
            name='remark',
            field=models.TextField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
