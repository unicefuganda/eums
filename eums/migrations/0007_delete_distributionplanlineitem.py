# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0006_auto_20140917_1423'),
    ]

    operations = [
        migrations.DeleteModel(
            name='DistributionPlanLineItem',
        ),
    ]
