# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_auto_20150808_1639'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConsigneeItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('received', models.BigIntegerField()),
                ('distributed', models.BigIntegerField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('item', models.ForeignKey(to='eums.Item')),
                ('latest_delivery', models.ForeignKey(to='eums.DistributionPlanNode')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='consigneeitem',
            unique_together=set([('consignee', 'item')]),
        ),
        migrations.AddField(
            model_name='question',
            name='when_answered',
            field=models.CharField(max_length=255, null=True),
            preserve_default=True,
        ),
    ]
