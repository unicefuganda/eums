# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0037_auto_20151102_1501'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplannode',
            name='total_value',
        ),
    ]
