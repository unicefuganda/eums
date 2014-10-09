# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('eums', '0040_nodelineitemrun_consignee'),
    ]

    operations = [
        migrations.RenameField(
            model_name='distributionplanlineitem',
            old_name='quantity',
            new_name='targeted_quantity',
        ),
        migrations.RemoveField(
            model_name='distributionplanlineitem',
            name='under_current_supply_plan',
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='consignee',
            field=models.ForeignKey(default=1, to='eums.Consignee'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='contact_person',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='contact_phone_number',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='mode_of_delivery',
            field=models.CharField(default='Road', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='programme_focal',
            field=models.ForeignKey(default=1, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='tracked',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='distributionplanlineitem',
            name='item',
            field=models.ForeignKey(to='eums.SalesOrderItem'),
        ),
    ]
