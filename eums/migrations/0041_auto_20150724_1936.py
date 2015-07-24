# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0040_add_permissions'),
    ]

    operations = [
        migrations.RenameField(
            model_name='distributionplannode',
            old_name='planned_distribution_date',
            new_name='delivery_date',
        ),
    ]
