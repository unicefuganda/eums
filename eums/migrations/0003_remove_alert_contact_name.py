# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0002_auto_20160122_1154'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='alert',
            name='contact_name',
        ),
    ]
