# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0033_auto_20150617_1647'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplannode',
            name='mode_of_delivery',
        ),
    ]
