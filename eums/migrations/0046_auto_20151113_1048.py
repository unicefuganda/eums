# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0045_auto_20151112_1000'),
    ]

    operations = [
        migrations.RenameField(
            model_name='distributionplan',
            old_name='days_needed_for_distribution',
            new_name='time_limitation_on_distribution',
        ),
        migrations.RemoveField(
            model_name='distributionplan',
            name='distribution_required',
        ),
    ]
