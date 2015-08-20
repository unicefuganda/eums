# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('eums', '0009_auto_20150813_0908'),
    ]

    operations = [
        migrations.CreateModel(
            name='Alert',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_type', model_utils.fields.StatusField(default=b'waybill', max_length=100, no_check_for_status=True, choices=[(b'waybill', b'waybill'), (b'purchase_order', b'purchase_order')])),
                ('order_number', models.IntegerField(unique=True)),
                ('issue', model_utils.fields.StatusField(default=b'not_received', max_length=100, no_check_for_status=True, choices=[(b'not_received', b'not_received'), (b'bad_condition', b'bad_condition')])),
                ('is_resolved', models.BooleanField(default=False)),
                ('remarks', models.TextField(null=True, blank=True)),
                ('consignee_name', models.CharField(max_length=255)),
                ('contact_name', models.CharField(max_length=255)),
                ('created_at', models.DateField(auto_now=True)),
                ('delivery_sender', models.ForeignKey(editable=False, to=settings.AUTH_USER_MODEL)),
                ('runnable', models.ForeignKey(to='eums.Runnable')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
