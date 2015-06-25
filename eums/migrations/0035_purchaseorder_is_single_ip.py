# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0034_remove_distributionplannode_mode_of_delivery'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='is_single_ip',
            field=models.NullBooleanField(),
            preserve_default=True,
        ),
    ]
