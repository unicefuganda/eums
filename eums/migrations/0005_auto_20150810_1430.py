# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0004_auto_20150810_1156'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='consigneeitem',
            name='distributed',
        ),
        migrations.RemoveField(
            model_name='consigneeitem',
            name='latest_delivery',
        ),
        migrations.RemoveField(
            model_name='consigneeitem',
            name='received',
        ),
        migrations.AddField(
            model_name='consigneeitem',
            name='amount_distributed',
            field=models.BigIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='consigneeitem',
            name='amount_received',
            field=models.BigIntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='consigneeitem',
            name='deliveries',
            field=djorm_pgarray.fields.IntegerArrayField(),
            preserve_default=True,
        ),
    ]
