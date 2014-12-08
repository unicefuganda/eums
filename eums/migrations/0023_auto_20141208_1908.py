# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0022_auto_20141208_1720'),
    ]

    operations = [
        migrations.AlterField(
            model_name='programme',
            name='wbs_element_ex',
            field=models.CharField(unique=True, max_length=255),
        ),
    ]
