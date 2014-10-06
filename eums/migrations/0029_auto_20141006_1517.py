# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0028_auto_20141006_1504'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='runqueue',
            name='consignee',
        ),
        migrations.AddField(
            model_name='runqueue',
            name='contact_person_id',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
    ]
