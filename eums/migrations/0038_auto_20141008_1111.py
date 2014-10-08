# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0037_auto_20141007_1813'),
    ]

    operations = [
        migrations.AddField(
            model_name='multiplechoicequestion',
            name='final',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='numericquestion',
            name='final',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='textquestion',
            name='final',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
