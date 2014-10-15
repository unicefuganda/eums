# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0006_releaseorder_waybill'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='consignee',
        ),
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='contact_person',
        ),
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='contact_phone_number',
        ),
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='destination_location',
        ),
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='mode_of_delivery',
        ),
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='programme_focal',
        ),
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='tracked',
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='location',
            field=models.CharField(default='default location', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='mode_of_delivery',
            field=models.CharField(default='WAREHOUSE', max_length=255, choices=[(b'DIRECT_DELIVERY', b'Direct Delivery'), (b'WAREHOUSE', b'Warehouse')]),
            preserve_default=False,
        ),
    ]
