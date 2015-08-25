# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0013_remove_alert_delivery_sender'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='balance',
            field=models.IntegerField(default=0, null=True, blank=True),
            preserve_default=True,
        ),
    ]
