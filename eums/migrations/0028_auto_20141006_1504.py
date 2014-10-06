# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0027_merge'),
    ]

    operations = [
        migrations.CreateModel(
            name='RunQueue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('status', model_utils.fields.StatusField(default=b'not_started', max_length=100, no_check_for_status=True, choices=[(b'not_started', b'not_started'), (b'started', b'started')])),
                ('start_run_date', models.DateTimeField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('node_line_item', models.ForeignKey(to='eums.DistributionPlanLineItem')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='salesorderitem',
            name='quantity',
            field=models.IntegerField(),
        ),
    ]
