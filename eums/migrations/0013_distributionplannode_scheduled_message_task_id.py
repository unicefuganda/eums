# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0012_auto_20140926_1434'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='scheduled_message_task_id',
            field=models.CharField(max_length=255, null=True, blank=True),
            preserve_default=True,
        ),
    ]
