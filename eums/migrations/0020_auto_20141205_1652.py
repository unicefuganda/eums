# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0019_auto_20141205_1411'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='salesorderitem',
            unique_together=set([('item', 'sales_order')]),
        ),
    ]
