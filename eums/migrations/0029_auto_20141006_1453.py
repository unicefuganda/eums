# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0028_auto_20141006_1431'),
    ]

    operations = [
        migrations.RenameField(
            model_name='multiplechoiceanswer',
            old_name='node_run',
            new_name='line_item_run',
        ),
        migrations.RenameField(
            model_name='numericanswer',
            old_name='node_run',
            new_name='line_item_run',
        ),
        migrations.RenameField(
            model_name='textanswer',
            old_name='node_run',
            new_name='line_item_run',
        ),
    ]
