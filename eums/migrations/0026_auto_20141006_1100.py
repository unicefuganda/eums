# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0025_auto_20141006_1054'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='uuids',
            field=models.TextField(),
        ),
    ]
