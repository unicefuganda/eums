# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0034_auto_20141007_1433'),
    ]

    operations = [
        migrations.CreateModel(
            name='MultipleChoiceQuestion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('uuids', models.TextField()),
                ('label', models.CharField(unique=True, max_length=255)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='NumericQuestion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('uuids', models.TextField()),
                ('label', models.CharField(unique=True, max_length=255)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TextQuestion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('uuids', models.TextField()),
                ('label', models.CharField(unique=True, max_length=255)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='multiplechoiceanswer',
            name='question',
            field=models.ForeignKey(to='eums.MultipleChoiceQuestion'),
        ),
        migrations.AlterField(
            model_name='numericanswer',
            name='question',
            field=models.ForeignKey(to='eums.NumericQuestion'),
        ),
        migrations.AlterField(
            model_name='option',
            name='question',
            field=models.ForeignKey(to='eums.MultipleChoiceQuestion'),
        ),
        migrations.AlterField(
            model_name='textanswer',
            name='question',
            field=models.ForeignKey(to='eums.TextQuestion'),
        ),
        migrations.DeleteModel(
            name='Question',
        ),
    ]
