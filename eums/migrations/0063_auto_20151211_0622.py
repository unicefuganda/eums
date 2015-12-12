# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0062_merge'),
    ]

    operations = [
        migrations.RenameField(
            model_name='flow',
            old_name='for_runnable_type',
            new_name='label',
        ),
    ]
