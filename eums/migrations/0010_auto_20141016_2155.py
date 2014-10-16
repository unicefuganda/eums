# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0009_auto_20141016_1733'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='multiplechoiceanswer',
            name='line_item_run',
        ),
        migrations.RemoveField(
            model_name='numericanswer',
            name='line_item_run',
        ),
        migrations.RemoveField(
            model_name='textanswer',
            name='line_item_run',
        ),
        migrations.AlterField(
            model_name='distributionplanlineitem',
            name='remark',
            field=models.TextField(),
        ),
    ]
