# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0010_distributionplannode_additional_remarks'),
    ]

    operations = [
        migrations.CreateModel(
            name='Upload',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('file', models.FileField(upload_to=b'photos/%Y/%m/%d')),
                ('plan', models.ForeignKey(to='eums.DistributionPlan', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
