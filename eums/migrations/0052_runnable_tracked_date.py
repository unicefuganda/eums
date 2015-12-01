# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0051_auto_20151118_1206'),
    ]

    operations = [
        migrations.AddField(
            model_name='runnable',
            name='tracked_date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
    ]
