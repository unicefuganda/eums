# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0014_auto_20140926_1644'),
    ]

    operations = [
        migrations.DeleteModel(
            name='SupplyPlan',
        ),
    ]
