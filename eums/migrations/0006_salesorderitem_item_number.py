# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0005_auto_20141121_1547'),
    ]

    operations = [
        migrations.AddField(
            model_name='salesorderitem',
            name='item_number',
            field=models.IntegerField(default=10),
            preserve_default=False,
        ),
    ]
