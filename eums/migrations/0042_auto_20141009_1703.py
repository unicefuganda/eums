# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0041_auto_20141009_1414'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplan',
            name='name',
        ),
        migrations.AlterField(
            model_name='nodelineitemrun',
            name='status',
            field=model_utils.fields.StatusField(default=b'scheduled', max_length=100, no_check_for_status=True, choices=[(b'scheduled', b'scheduled'), (b'completed', b'completed'), (b'expired', b'expired'), (b'cancelled', b'cancelled')]),
        ),
    ]
