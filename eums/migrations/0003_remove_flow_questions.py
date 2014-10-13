# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0002_auto_20141013_1223'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='flow',
            name='questions',
        ),
    ]
