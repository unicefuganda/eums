# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0019_auto_20150828_0957'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='alert',
            options={'ordering': ['-created_on']},
        ),
    ]
