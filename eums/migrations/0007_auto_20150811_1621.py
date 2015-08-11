# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0006_merge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='multiplechoiceanswer',
            name='question',
            field=models.ForeignKey(related_name=b'answers', to='eums.MultipleChoiceQuestion'),
        ),
    ]
