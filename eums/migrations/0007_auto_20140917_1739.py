# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0006_delete_distributionplanitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='DistributionPlanNode',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('parent', models.ForeignKey(related_name=b'children', blank=True, to='eums.DistributionPlanNode', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='distributionplan',
            name='line_items',
        ),
    ]
