# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0001_initial'),
        ('eums', '0032_auto_20150608_1336'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('item_number', models.IntegerField(default=0, null=True)),
                ('quantity', models.DecimalField(null=True, max_digits=12, decimal_places=2)),
                ('item', models.ForeignKey(to='eums.Item')),
                ('polymorphic_ctype', models.ForeignKey(related_name=b'polymorphic_eums.orderitem_set+', editable=False, to='contenttypes.ContentType', null=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='id',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='item_number',
        ),
        migrations.RemoveField(
            model_name='purchaseorderitem',
            name='quantity',
        ),
        migrations.RemoveField(
            model_name='releaseorderitem',
            name='id',
        ),
        migrations.RemoveField(
            model_name='releaseorderitem',
            name='item',
        ),
        migrations.RemoveField(
            model_name='releaseorderitem',
            name='item_number',
        ),
        migrations.RemoveField(
            model_name='releaseorderitem',
            name='quantity',
        ),
        migrations.RemoveField(
            model_name='salesorderitem',
            name='id',
        ),
        migrations.RemoveField(
            model_name='salesorderitem',
            name='item',
        ),
        migrations.RemoveField(
            model_name='salesorderitem',
            name='item_number',
        ),
        migrations.RemoveField(
            model_name='salesorderitem',
            name='quantity',
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='orderitem_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to='eums.OrderItem'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='releaseorderitem',
            name='orderitem_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to='eums.OrderItem'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='salesorderitem',
            name='orderitem_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to='eums.OrderItem'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='distributionplannode',
            name='item',
            field=models.ForeignKey(to='eums.OrderItem'),
        ),
        migrations.AlterField(
            model_name='releaseorder',
            name='purchase_order',
            field=models.ForeignKey(related_name=b'release_orders', to='eums.PurchaseOrder', null=True),
        ),
    ]
