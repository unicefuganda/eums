# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0018_auto_20141028_1726'),
    ]

    operations = [
        migrations.AlterField(
            model_name='distributionplannode',
            name='tree_position',
            field=models.CharField(max_length=255, choices=[(b'MIDDLE_MAN', b'Middleman'), (b'END_USER', b'End User'), (b'IMPLEMENTING_PARTNER', b'Implementing Partner')]),
        ),
        migrations.AlterField(
            model_name='flow',
            name='for_node_type',
            field=models.CharField(unique=True, max_length=255, choices=[(b'END_USER', b'End user'), (b'MIDDLE_MAN', b'Middleman'), (b'IMPLEMENTING_PARTNER', b'Implementing Partner')]),
        ),
    ]
