# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0015_delete_supplyplan'),
    ]

    operations = [
        migrations.CreateModel(
            name='SalesOrder',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_number', models.CharField(max_length=255)),
                ('quantity', models.IntegerField()),
                ('net_price', models.DecimalField(max_digits=20, decimal_places=4)),
                ('net_value', models.DecimalField(max_digits=20, decimal_places=4)),
                ('issue_date', models.DateField()),
                ('delivery_date', models.DateField(null=True)),
                ('item', models.ForeignKey(to='eums.Item')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
