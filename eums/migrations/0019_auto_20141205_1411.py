# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations, connection


def make_order_number_column_type_integer(apps, schema_editor):
    cursor = connection.cursor()
    cursor.execute(
        'ALTER TABLE eums_purchaseorder ALTER COLUMN order_number TYPE integer USING (trim(order_number)::integer);')


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0018_auto_20141205_1126'),
    ]

    operations = [
        migrations.RunPython(make_order_number_column_type_integer),
        migrations.AlterField(
            model_name='purchaseorder',
            name='order_number',
            field=models.IntegerField(unique=True),
        ),
    ]
