# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0011_update_programme_wbs_element'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
    ]
