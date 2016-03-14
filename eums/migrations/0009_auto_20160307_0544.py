# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0007_systemsettings_country_label'),
    ]

    operations = [
        migrations.RenameField(
            model_name='flow',
            old_name='end_nodes',
            new_name='final_end_nodes',
        ),
        migrations.AddField(
            model_name='flow',
            name='optional_end_nodes',
            field=djorm_pgarray.fields.IntegerArrayField(dimension=2),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='flow',
            name='temp_end_nodes',
            field=djorm_pgarray.fields.IntegerArrayField(dimension=2),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='runqueue',
            name='start_time',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
    ]
