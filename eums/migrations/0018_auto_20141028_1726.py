# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0017_auto_20141024_1246'),
    ]

    operations = [
        migrations.AlterField(
            model_name='distributionplanlineitem',
            name='remark',
            field=models.TextField(null=True, blank=True),
        ),
    ]
