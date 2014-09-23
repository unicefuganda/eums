# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0005_auto_20140916_1223'),
    ]

    operations = [
        migrations.DeleteModel(
            name='DistributionPlanItem',
        ),
    ]
