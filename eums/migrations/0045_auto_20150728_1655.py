# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0044_rename_noderun_run'),
    ]

    operations = [
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
    ]
