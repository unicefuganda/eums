# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0011_auto_20160316_0827'),
    ]

    operations = [
        migrations.AlterField(
            model_name='run',
            name='status',
            field=model_utils.fields.StatusField(default=b'not_started', max_length=100, no_check_for_status=True, choices=[(b'not_started', b'not_started'), (b'scheduled', b'scheduled'), (b'completed', b'completed'), (b'expired', b'expired'), (b'cancelled', b'cancelled')]),
        ),
    ]
