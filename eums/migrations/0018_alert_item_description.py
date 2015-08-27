# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0017_remove_distributionplan_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='alert',
            name='item_description',
            field=models.CharField(max_length=255, null=True),
            preserve_default=True,
        ),
    ]
