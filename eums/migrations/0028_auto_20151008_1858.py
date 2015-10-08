# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0027_distributionplannode_programme'),
    ]

    operations = [
        migrations.AlterField(
            model_name='distributionplannode',
            name='programme',
            field=models.ForeignKey(related_name=b'nodes', blank=True, to='eums.Programme', null=True),
        ),
    ]
