# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0016_auto_20150826_1335'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplan',
            name='date',
        ),
    ]
