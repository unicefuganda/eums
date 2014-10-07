# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0032_nodelineitemrun_phone'),
    ]

    operations = [
        migrations.AddField(
            model_name='salesorder',
            name='description',
            field=models.CharField(max_length=255, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='salesorder',
            name='programme',
            field=models.ForeignKey(default=1, to='eums.Programme'),
            preserve_default=False,
        ),
    ]
