# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0009_purchaseorderitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='programme',
            name='wbs_element_ex',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
    ]
