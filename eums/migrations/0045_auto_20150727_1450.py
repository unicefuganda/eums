# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0044_rename_noderun_run'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='run',
            name='node',
        ),
        migrations.RemoveField(
            model_name='runqueue',
            name='node',
        ),
        migrations.AddField(
            model_name='run',
            name='runnable',
            field=models.ForeignKey(default=0, to='eums.Runnable'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='runqueue',
            name='runnable',
            field=models.ForeignKey(default=0, to='eums.Runnable'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='multiplechoiceanswer',
            name='run',
            field=models.ForeignKey(to='eums.Run'),
        ),
        migrations.AlterField(
            model_name='numericanswer',
            name='run',
            field=models.ForeignKey(to='eums.Run'),
        ),
        migrations.AlterField(
            model_name='textanswer',
            name='run',
            field=models.ForeignKey(to='eums.Run'),
        ),
        migrations.RenameField(
            model_name='flow',
            old_name='for_node_type',
            new_name='for_runnable_type',
        ),
    ]
