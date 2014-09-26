# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0013_distributionplannode_scheduled_message_task_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='NodeRun',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('scheduled_message_task_id', models.CharField(max_length=255)),
                ('node', models.ForeignKey(to='eums.DistributionPlanNode')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='scheduled_message_task_id',
        ),
    ]
