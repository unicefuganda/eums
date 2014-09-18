# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0009_distributionplannode_distribution_plan'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='consignee',
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='consignee',
            field=models.ForeignKey(default=1, to='eums.Consignee'),
            preserve_default=False,
        ),
    ]
