# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0021_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='option',
            name='question',
            field=models.ForeignKey(default=1, to='eums.Question'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='question',
            name='type',
            field=models.CharField(max_length=255, choices=[(b'MULTIPLE_CHOICE', b'Multiple Choice'), (b'TEXT', b'Open Ended'), (b'NUMERIC', b'Numeric')]),
        ),
        migrations.AlterUniqueTogether(
            name='option',
            unique_together=set([('text', 'question')]),
        ),
    ]
