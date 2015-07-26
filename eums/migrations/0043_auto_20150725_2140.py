# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0042_auto_20150724_2028'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplan',
            name='id',
        ),
        migrations.AddField(
            model_name='distributionplan',
            name='runnable_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.Runnable'),
            preserve_default=False,
        ),
    ]
