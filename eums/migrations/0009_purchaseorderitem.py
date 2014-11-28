# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0008_purchaseorder'),
    ]

    operations = [
        migrations.CreateModel(
            name='PurchaseOrderItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('item_number', models.IntegerField()),
                ('purchase_order', models.ForeignKey(to='eums.PurchaseOrder')),
                ('sales_order_item', models.ForeignKey(to='eums.SalesOrderItem')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
