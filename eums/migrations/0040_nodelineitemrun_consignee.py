# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0039_distributionplannode_tree_position'),
    ]

    operations = [
        migrations.AddField(
            model_name='nodelineitemrun',
            name='consignee',
            field=models.ForeignKey(default=1, to='eums.Consignee'),
            preserve_default=False,
        ),
    ]
