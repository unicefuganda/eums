# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0046_consignee_created_by_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='Arc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.IntegerField()),
                ('source', models.ForeignKey(related_name=b'arcs_out', blank=True, to='eums.DistributionPlanNode', null=True)),
                ('target', models.ForeignKey(related_name=b'arcs_in', to='eums.DistributionPlanNode')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
