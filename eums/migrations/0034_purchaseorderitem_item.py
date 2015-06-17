# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0033_auto_20150617_1018'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorderitem',
            name='item',
            field=models.ForeignKey(default=1, to='eums.Item'),
            preserve_default=False,
        )
    ]
