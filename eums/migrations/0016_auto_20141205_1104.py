# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, connection


def make_order_number_column_type_integer(apps, schema_editor):
    cursor = connection.cursor()
    cursor.execute(
        'ALTER TABLE eums_releaseorder ALTER COLUMN order_number TYPE integer USING (trim(order_number)::integer);')


def make_waybill_column_type_integer(apps, schema_editor):
    cursor = connection.cursor()
    cursor.execute(
        'ALTER TABLE eums_releaseorder ALTER COLUMN waybill TYPE integer USING (trim(waybill)::integer);')


class Migration(migrations.Migration):
    dependencies = [
        ('eums', '0015_auto_20141204_1808'),
    ]

    operations = [
        migrations.RunPython(make_order_number_column_type_integer),
        migrations.RunPython(make_waybill_column_type_integer)
    ]
