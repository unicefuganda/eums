# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0038_auto_20141008_1111'),
    ]

    operations = [
        migrations.AddField(
            model_name='distributionplannode',
            name='tree_position',
            field=models.CharField(default='END_USER', max_length=255, choices=[(b'MIDDLE_MAN', b'Middleman'), (b'END_USER', b'End User')]),
            preserve_default=False,
        ),
    ]
