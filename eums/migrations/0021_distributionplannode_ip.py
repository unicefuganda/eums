# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0020_auto_20150902_1026'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='ip',
            field=models.ForeignKey(blank=True, to='eums.Consignee', null=True),
            preserve_default=True,
        ),
    ]
