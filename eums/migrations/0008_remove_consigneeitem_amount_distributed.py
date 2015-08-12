# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0007_auto_20150811_1621'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='consigneeitem',
            name='amount_distributed',
        ),
    ]
