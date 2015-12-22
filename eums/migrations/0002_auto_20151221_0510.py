# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='VisionSyncInfo',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('sync_date', models.DateTimeField(auto_now_add=True)),
                ('so_status', model_utils.fields.StatusField(default=b'NOT_RUNNING', max_length=100, no_check_for_status=True, choices=[(b'SUCCESS', b'SUCCESS'), (b'FAILURE', b'FAILURE'), (b'NOT_RUNNING', b'NOT_RUNNING')])),
                ('po_status', model_utils.fields.StatusField(default=b'NOT_RUNNING', max_length=100, no_check_for_status=True, choices=[(b'SUCCESS', b'SUCCESS'), (b'FAILURE', b'FAILURE'), (b'NOT_RUNNING', b'NOT_RUNNING')])),
                ('ro_status', model_utils.fields.StatusField(default=b'NOT_RUNNING', max_length=100, no_check_for_status=True, choices=[(b'SUCCESS', b'SUCCESS'), (b'FAILURE', b'FAILURE'), (b'NOT_RUNNING', b'NOT_RUNNING')])),
                ('consignee_status', model_utils.fields.StatusField(default=b'NOT_RUNNING', max_length=100, no_check_for_status=True, choices=[(b'SUCCESS', b'SUCCESS'), (b'FAILURE', b'FAILURE'), (b'NOT_RUNNING', b'NOT_RUNNING')])),
                ('programme_status', model_utils.fields.StatusField(default=b'NOT_RUNNING', max_length=100, no_check_for_status=True, choices=[(b'SUCCESS', b'SUCCESS'), (b'FAILURE', b'FAILURE'), (b'NOT_RUNNING', b'NOT_RUNNING')])),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='systemsettings',
            name='sync_start_date',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='item',
            name='description',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='purchaseorderitem',
            name='sales_order_item',
            field=models.ForeignKey(to='eums.SalesOrderItem', null=True),
        ),
        migrations.AlterField(
            model_name='salesorderitem',
            name='description',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
