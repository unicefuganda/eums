# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0031_syncinfo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='syncinfo',
            name='status',
            field=model_utils.fields.StatusField(default=b'RUNNING', max_length=100, no_check_for_status=True, choices=[(b'SUCCESSFUL', b'SUCCESSFUL'), (b'FAILED', b'FAILED'), (b'RUNNING', b'RUNNING')]),
        ),
    ]
