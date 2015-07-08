# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0036_purchaseorder_po_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='consignee',
            name='imported_from_vision',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='consignee',
            name='location',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='releaseorderitem',
            name='release_order',
            field=models.ForeignKey(related_name=b'items', to='eums.ReleaseOrder'),
        ),
    ]
