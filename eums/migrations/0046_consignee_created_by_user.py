# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('eums', '0045_auto_20150727_1450'),
    ]

    operations = [
        migrations.AddField(
            model_name='consignee',
            name='created_by_user',
            field=models.ForeignKey(editable=False, to=settings.AUTH_USER_MODEL, null=True),
            preserve_default=True,
        ),
    ]
