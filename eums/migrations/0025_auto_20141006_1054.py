# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0024_question_uuid'),
    ]

    operations = [
        migrations.RenameField(
            model_name='question',
            old_name='uuid',
            new_name='uuids',
        ),
    ]
