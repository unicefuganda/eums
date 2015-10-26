# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0034_deleterecords'),
    ]

    operations = [
        migrations.AddField(
            model_name='deleterecords',
            name='nodes_with_deleted_dependencies',
            field=djorm_pgarray.fields.IntegerArrayField(),
            preserve_default=True,
        ),
    ]
