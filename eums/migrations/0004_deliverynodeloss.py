# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_remove_alert_contact_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryNodeLoss',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.IntegerField()),
                ('remark', models.CharField(max_length=255)),
                ('delivery_node', models.ForeignKey(related_name=b'losses', to='eums.DistributionPlanNode')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
