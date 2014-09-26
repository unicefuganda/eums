# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0011_distributionplan_name'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='distributionplannode',
            unique_together=set([('distribution_plan', 'consignee')]),
        ),
    ]
