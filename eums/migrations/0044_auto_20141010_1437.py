# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0043_auto_20141010_1432'),
    ]

    operations = [
        migrations.AlterField(
            model_name='flow',
            name='for_node_type',
            field=models.CharField(unique=True, max_length=255, choices=[(b'END_USER', b'End user'), (b'MIDDLE_MAN', b'Middleman')]),
        ),
    ]
