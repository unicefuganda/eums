# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0010_merge'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='visionsyncinfo',
            name='consignee_status',
        ),
        migrations.RemoveField(
            model_name='visionsyncinfo',
            name='po_status',
        ),
        migrations.RemoveField(
            model_name='visionsyncinfo',
            name='programme_status',
        ),
        migrations.RemoveField(
            model_name='visionsyncinfo',
            name='ro_status',
        ),
        migrations.RemoveField(
            model_name='visionsyncinfo',
            name='so_status',
        ),
        migrations.AddField(
            model_name='visionsyncinfo',
            name='end_date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='visionsyncinfo',
            name='is_daily_sync',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='visionsyncinfo',
            name='start_date',
            field=models.DateField(null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='visionsyncinfo',
            name='sync_status',
            field=model_utils.fields.StatusField(default=b'NOT_RUNNING', max_length=100, no_check_for_status=True, choices=[(0, 'dummy')]),
            preserve_default=True,
        ),
    ]
