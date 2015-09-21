# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0024_auto_20150919_1837'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributionplannode',
            name='ip',
        ),
        migrations.AddField(
            model_name='runnable',
            name='ip',
            field=models.ForeignKey(related_name=b'runnables', blank=True, to='eums.Consignee', null=True),
            preserve_default=True,
        ),
    ]
