# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0042_auto_20141009_1703'),
    ]

    operations = [
        migrations.CreateModel(
            name='Flow',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('rapid_pro_id', models.IntegerField()),
                ('end_questions', djorm_pgarray.fields.IntegerArrayField()),
                ('for_node_type', models.CharField(max_length=255, choices=[(b'END_USER', b'End user'), (b'MIDDLE_MAN', b'Middleman')])),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('label', models.CharField(unique=True, max_length=255)),
                ('final', models.BooleanField(default=False)),
                ('uuids', djorm_pgarray.fields.TextArrayField(dbtype=b'text')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='flow',
            name='questions',
            field=models.ManyToManyField(to='eums.Question'),
            preserve_default=True,
        ),
        migrations.RemoveField(
            model_name='multiplechoicequestion',
            name='final',
        ),
        migrations.RemoveField(
            model_name='multiplechoicequestion',
            name='id',
        ),
        migrations.RemoveField(
            model_name='multiplechoicequestion',
            name='label',
        ),
        migrations.RemoveField(
            model_name='multiplechoicequestion',
            name='text',
        ),
        migrations.RemoveField(
            model_name='multiplechoicequestion',
            name='uuids',
        ),
        migrations.RemoveField(
            model_name='numericquestion',
            name='final',
        ),
        migrations.RemoveField(
            model_name='numericquestion',
            name='id',
        ),
        migrations.RemoveField(
            model_name='numericquestion',
            name='label',
        ),
        migrations.RemoveField(
            model_name='numericquestion',
            name='text',
        ),
        migrations.RemoveField(
            model_name='numericquestion',
            name='uuids',
        ),
        migrations.RemoveField(
            model_name='textquestion',
            name='final',
        ),
        migrations.RemoveField(
            model_name='textquestion',
            name='id',
        ),
        migrations.RemoveField(
            model_name='textquestion',
            name='label',
        ),
        migrations.RemoveField(
            model_name='textquestion',
            name='text',
        ),
        migrations.RemoveField(
            model_name='textquestion',
            name='uuids',
        ),
        migrations.AddField(
            model_name='multiplechoicequestion',
            name='question_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to='eums.Question'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='numericquestion',
            name='question_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to='eums.Question'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='textquestion',
            name='question_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, default=1, serialize=False, to='eums.Question'),
            preserve_default=False,
        ),
    ]
