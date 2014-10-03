# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0015_delete_supplyplan'),
    ]

    operations = [
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('uuid', models.CharField(max_length=255)),
                ('type', models.CharField(max_length=255, choices=[(b'MULTIPLE_CHOICE', b'Multiple Choice'), (b'OPEN_ENDED', b'Open Ended'), (b'NUMERIC', b'Numeric')])),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
