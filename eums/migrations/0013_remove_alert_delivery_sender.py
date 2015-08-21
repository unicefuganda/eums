# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0012_distributionplan_confirmed'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='alert',
            name='delivery_sender',
        ),
    ]
