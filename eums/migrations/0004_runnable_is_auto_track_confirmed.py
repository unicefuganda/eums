# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_systemsettings_notification_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='runnable',
            name='is_auto_track_confirmed',
            field=models.NullBooleanField(),
            preserve_default=True,
        ),
    ]
