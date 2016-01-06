# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0008_purchaseorder_tracked_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='releaseorder',
            name='date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='systemsettings',
            name='notification_message',
            field=models.TextField(default=b'', max_length=300, blank=True),
        ),
    ]
