# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0030_auto_20151022_1013'),
    ]

    operations = [
        migrations.CreateModel(
            name='SyncInfo',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(null=True, blank=True)),
                ('status', model_utils.fields.StatusField(default=b'SUCCESSFUL', max_length=100, no_check_for_status=True, choices=[(b'SUCCESSFUL', b'SUCCESSFUL'), (b'FAILED', b'FAILED'), (b'RUNNING', b'RUNNING')])),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
