# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0016_question'),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('node_run', models.ForeignKey(to='eums.NodeRun')),
                ('question', models.ForeignKey(to='eums.Question')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
