# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0017_answer'),
    ]

    operations = [
        migrations.CreateModel(
            name='MultipleChoiceAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('node_run', models.ForeignKey(to='eums.NodeRun')),
                ('question', models.ForeignKey(to='eums.Question')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='NumericAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.BigIntegerField()),
                ('node_run', models.ForeignKey(to='eums.NodeRun')),
                ('question', models.ForeignKey(to='eums.Question')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.CharField(max_length=255)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TextAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.CharField(max_length=255)),
                ('node_run', models.ForeignKey(to='eums.NodeRun')),
                ('question', models.ForeignKey(to='eums.Question')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='answer',
            name='node_run',
        ),
        migrations.RemoveField(
            model_name='answer',
            name='question',
        ),
        migrations.DeleteModel(
            name='Answer',
        ),
        migrations.AddField(
            model_name='multiplechoiceanswer',
            name='value',
            field=models.ForeignKey(to='eums.Option'),
            preserve_default=True,
        ),
    ]
