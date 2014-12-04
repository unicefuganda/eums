# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, connection


def make_order_number_column_type_integer(apps, schema_editor):
    cursor = connection.cursor()
    cursor.execute(
        'ALTER TABLE eums_salesorder ALTER COLUMN order_number TYPE integer USING (trim(order_number)::integer);')


class Migration(migrations.Migration):
    dependencies = [
        ('eums', '0013_userprofile_consignee'),
    ]

    operations = [
        migrations.RunPython(make_order_number_column_type_integer)
    ]
