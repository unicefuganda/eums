# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0039_remove_distributionplannode_total_value'),
    ]

    operations = [
        migrations.RenameField(
            model_name='runnable',
            old_name='runnable_value',
            new_name='total_value',
        ),
    ]
