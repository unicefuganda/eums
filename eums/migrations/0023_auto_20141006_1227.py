# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0022_auto_20141006_1222'),
    ]

    operations = [
        migrations.CreateModel(
            name='NodeLineItemRun',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('scheduled_message_task_id', models.CharField(max_length=255)),
                ('status', model_utils.fields.StatusField(default=b'not_started', max_length=100, no_check_for_status=True, choices=[(b'not_started', b'not_started'), (b'in_progress', b'in_progress'), (b'completed', b'completed'), (b'expired', b'expired')])),
                ('node_line_item', models.ForeignKey(to='eums.DistributionPlanLineItem')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='noderun',
            name='node_line_item',
        ),
        migrations.DeleteModel(
            name='NodeRun',
        ),
    ]
