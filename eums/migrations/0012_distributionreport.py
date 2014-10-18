# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0011_auto_20141016_2156'),
    ]

    operations = [
        migrations.CreateModel(
            name='DistributionReport',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('total_received_with_quality_issues', models.IntegerField()),
                ('total_received_with_quantity_issues', models.IntegerField()),
                ('total_received_without_issues', models.IntegerField()),
                ('total_not_received', models.IntegerField()),
                ('total_distributed_with_quality_issues', models.IntegerField()),
                ('total_distributed_with_quantity_issues', models.IntegerField()),
                ('total_distributed_without_issues', models.IntegerField()),
                ('total_not_distributed', models.IntegerField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('programme', models.ForeignKey(to='eums.Programme')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
