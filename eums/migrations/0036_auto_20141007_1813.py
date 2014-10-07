# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0035_auto_20141007_1653'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='multiplechoicequestion',
            name='uuids',
        ),
        migrations.RemoveField(
            model_name='numericquestion',
            name='uuids',
        ),
        migrations.RemoveField(
            model_name='textquestion',
            name='uuids',
        ),
    ]
