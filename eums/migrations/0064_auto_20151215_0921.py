# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0063_auto_20151211_0622'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='flow',
            name='rapid_pro_id',
        ),
        migrations.RemoveField(
            model_name='question',
            name='uuids',
        ),
    ]
