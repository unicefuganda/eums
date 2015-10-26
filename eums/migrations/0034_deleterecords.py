# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0033_merge'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeleteRecords',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('nodes_to_delete', djorm_pgarray.fields.IntegerArrayField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
