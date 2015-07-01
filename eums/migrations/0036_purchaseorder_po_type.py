# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0035_purchaseorder_is_single_ip'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='po_type',
            field=models.CharField(max_length=255, null=True),
            preserve_default=True,
        ),
    ]
