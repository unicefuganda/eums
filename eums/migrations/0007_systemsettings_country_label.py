# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0006_numericanswer_remark'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemsettings',
            name='country_label',
            field=models.TextField(default=b'', max_length=300, blank=True),
            preserve_default=True,
        ),
    ]
