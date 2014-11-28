# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0006_salesorderitem_item_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salesorderitem',
            name='item_number',
            field=models.IntegerField(default=0),
        ),
    ]
