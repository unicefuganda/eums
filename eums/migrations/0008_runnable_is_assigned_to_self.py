# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0007_systemsettings_country_label'),
    ]

    operations = [
        migrations.AddField(
            model_name='runnable',
            name='is_assigned_to_self',
            field=models.NullBooleanField(),
            preserve_default=True,
        ),
    ]
