# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0028_auto_20150316_1811'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='salesorderitem',
            unique_together=set([('item', 'item_number', 'sales_order')]),
        ),
    ]
