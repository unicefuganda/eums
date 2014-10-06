# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0020_salesorderitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='noderun',
            name='status',
            field=model_utils.fields.StatusField(default=b'not_started', max_length=100, no_check_for_status=True, choices=[(0, 'dummy')]),
            preserve_default=True,
        ),
    ]
