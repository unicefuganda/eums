# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0031_auto_20150508_1036'),
    ]

    operations = [
        migrations.AlterField(
            model_name='releaseorder',
            name='sales_order',
            field=models.ForeignKey(related_name=b'release_orders', to='eums.SalesOrder'),
        ),
    ]
