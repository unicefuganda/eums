# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0047_arc'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplannode',
            name='parent',
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='targeted_quantity',
        ),
    ]
