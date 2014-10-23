# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0014_auto_20141018_1400'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='programme',
            name='focal_person',
        ),
    ]
