# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0023_auto_20150919_1741'),
    ]

    operations = [
        migrations.AlterField(
            model_name='multiplechoiceanswer',
            name='run',
            field=models.ForeignKey(to='eums.Run'),
        ),
        migrations.AlterField(
            model_name='run',
            name='runnable',
            field=models.ForeignKey(to='eums.Runnable'),
        ),
    ]
