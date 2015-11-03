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
            name='is_retriggered',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
