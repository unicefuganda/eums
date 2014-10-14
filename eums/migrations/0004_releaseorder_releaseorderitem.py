# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0003_remove_flow_questions'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReleaseOrder',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_number', models.CharField(max_length=255)),
                ('delivery_date', models.DateField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('sales_order', models.ForeignKey(to='eums.SalesOrder')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ReleaseOrderItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('purchase_order', models.CharField(max_length=100)),
                ('quantity', models.DecimalField(max_digits=12, decimal_places=2)),
                ('value', models.DecimalField(max_digits=12, decimal_places=2)),
                ('item', models.ForeignKey(to='eums.Item')),
                ('release_order', models.ForeignKey(to='eums.ReleaseOrder')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
