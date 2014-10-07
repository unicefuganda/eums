# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0036_auto_20141007_1813'),
    ]

    operations = [
        migrations.AddField(
            model_name='multiplechoicequestion',
            name='uuids',
            field=djorm_pgarray.fields.TextArrayField(dbtype=b'text'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='numericquestion',
            name='uuids',
            field=djorm_pgarray.fields.TextArrayField(dbtype=b'text'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='textquestion',
            name='uuids',
            field=djorm_pgarray.fields.TextArrayField(dbtype=b'text'),
            preserve_default=True,
        ),
    ]
