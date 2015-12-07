# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0059_purchaseorder_shipment_date'),
    ]

    operations = [
        migrations.RenameField(
            model_name='purchaseorder',
            old_name='shipment_date',
            new_name='last_shipment_date',
        ),
    ]
