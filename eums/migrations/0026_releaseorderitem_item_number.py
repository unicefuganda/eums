# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0025_auto_20150306_1143'),
    ]

    operations = [
        migrations.AddField(
            model_name='releaseorderitem',
            name='item_number',
            field=models.IntegerField(null=True),
            preserve_default=True,
        ),
    ]
