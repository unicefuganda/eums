# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0007_auto_20141015_1037'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='consignee',
            name='contact_person_id',
        ),
        migrations.RemoveField(
            model_name='nodelineitemrun',
            name='consignee',
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='contact_person_id',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='distributionplannode',
            unique_together=None,
        ),
    ]
