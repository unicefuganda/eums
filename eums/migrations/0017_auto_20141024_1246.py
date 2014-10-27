# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0016_consignee_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='unit',
            field=models.ForeignKey(to='eums.ItemUnit', null=True),
        ),
    ]
