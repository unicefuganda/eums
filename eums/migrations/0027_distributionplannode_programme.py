# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0026_auto_20150922_1602'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='programme',
            field=models.ForeignKey(blank=True, to='eums.Programme', null=True),
            preserve_default=True,
        ),
    ]
