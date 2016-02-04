# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_remove_alert_contact_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemsettings',
            name='district_label',
            field=models.TextField(default=b'District', max_length=300, blank=True),
            preserve_default=True,
        ),
    ]
