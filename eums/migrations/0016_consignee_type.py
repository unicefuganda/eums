# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0015_remove_programme_focal_person'),
    ]

    operations = [
        migrations.AddField(
            model_name='consignee',
            name='type',
            field=model_utils.fields.StatusField(default=b'implementing_partner', max_length=100, no_check_for_status=True, choices=[(0, 'dummy')]),
            preserve_default=True,
        ),
    ]
