# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0019_auto_20141003_1002'),
    ]

    operations = [
        migrations.CreateModel(
            name='SalesOrderItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.IntegerField()),
                ('net_price', models.DecimalField(max_digits=20, decimal_places=4)),
                ('net_value', models.DecimalField(max_digits=20, decimal_places=4)),
                ('issue_date', models.DateField()),
                ('delivery_date', models.DateField(null=True)),
                ('item', models.ForeignKey(to='eums.Item')),
                ('sales_order', models.ForeignKey(to='eums.SalesOrder')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
