# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0010_auto_20141016_2155'),
    ]

    operations = [
        migrations.AddField(
            model_name='multiplechoiceanswer',
            name='line_item_run',
            field=models.ForeignKey(default=1, to='eums.NodeLineItemRun'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='numericanswer',
            name='line_item_run',
            field=models.ForeignKey(default=1, to='eums.NodeLineItemRun'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='textanswer',
            name='line_item_run',
            field=models.ForeignKey(default=1, to='eums.NodeLineItemRun'),
            preserve_default=False,
        ),
    ]
