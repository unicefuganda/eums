# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='flow',
            name='end_questions',
        ),
        migrations.AddField(
            model_name='flow',
            name='end_nodes',
            field=djorm_pgarray.fields.IntegerArrayField(dimension=2),
            preserve_default=True,
        ),
    ]
