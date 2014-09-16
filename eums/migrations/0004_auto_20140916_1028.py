# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_auto_20140915_1258'),
    ]

    operations = [
        migrations.RenameField(
            model_name='distributionplan',
            old_name='items',
            new_name='line_items',
        ),
    ]
