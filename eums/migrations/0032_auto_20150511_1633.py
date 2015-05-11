# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0031_auto_20150508_1036'),
    ]

    operations = [
        migrations.RunSQL('ALTER TABLE eums_nodelineitemrun RENAME TO eums_noderun'),
        migrations.AlterModelTable(name='NodeRun', table='noderun')
    ]
