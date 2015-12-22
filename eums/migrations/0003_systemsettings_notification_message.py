# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0002_auto_20151221_0510'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemsettings',
            name='notification_message',
            field=models.TextField(default=b'', max_length=300),
            preserve_default=True,
        ),
    ]
