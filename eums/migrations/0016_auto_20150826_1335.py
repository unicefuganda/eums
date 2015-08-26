# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0015_auto_20150825_1546'),
    ]

    operations = [
        migrations.AlterField(
            model_name='alert',
            name='order_type',
            field=model_utils.fields.StatusField(default=b'Waybill', max_length=100, no_check_for_status=True, choices=[(b'Waybill', b'Waybill'), (b'Purchase Order', b'Purchase Order')]),
        ),
    ]
