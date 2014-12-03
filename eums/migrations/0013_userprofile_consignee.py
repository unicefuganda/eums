# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0012_purchaseorder_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='consignee',
            field=models.ForeignKey(blank=True, to='eums.Consignee', null=True),
            preserve_default=True,
        ),
    ]
