# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0062_merge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='runnable',
            name='contact_person_id',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='runnable',
            name='location',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
