# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0012_distributionreport'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='distributionreport',
            unique_together=set([('consignee', 'programme')]),
        ),
    ]
