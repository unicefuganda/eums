# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0006_remove_releaseorder_tracked_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='releaseorder',
            name='tracked_date',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
    ]
