# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0037_auto_20150708_1215'),
    ]

    operations = [
        migrations.AddField(
            model_name='consignee',
            name='remarks',
            field=models.TextField(null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='consignee',
            name='customer_id',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='consignee',
            name='location',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
    ]
