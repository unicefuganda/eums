# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0005_releaseorder_tracked_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='releaseorder',
            name='tracked_date',
        ),
    ]
