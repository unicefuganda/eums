# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0017_item_code'),
    ]

    operations = [
        migrations.RenameField(
            model_name='item',
            old_name='code',
            new_name='material_code',
        ),
    ]
