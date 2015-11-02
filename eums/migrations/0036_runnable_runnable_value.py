# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0035_deleterecords_nodes_with_deleted_dependencies'),
    ]

    operations = [
        migrations.AddField(
            model_name='runnable',
            name='runnable_value',
            field=models.DecimalField(null=True, max_digits=12, decimal_places=2),
            preserve_default=True,
        ),
    ]
