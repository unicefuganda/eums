# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0008_remove_consigneeitem_amount_distributed'),
    ]

    operations = [
        migrations.AddField(
            model_name='multiplechoicequestion',
            name='type',
            field=models.CharField(default=b'multipleChoice', max_length=255, choices=[(b'multipleChoice', b'multiple choice question')]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='numericquestion',
            name='type',
            field=models.CharField(default=b'numeric', max_length=255, choices=[(b'numeric', b'numeric question')]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='textquestion',
            name='type',
            field=models.CharField(default=b'text', max_length=255, choices=[(b'text', b'text question'), (b'date', b'date question')]),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='flow',
            name='for_runnable_type',
            field=models.CharField(unique=True, max_length=255, choices=[(b'END_USER', b'End User'), (b'MIDDLE_MAN', b'Middleman'), (b'IMPLEMENTING_PARTNER', b'Implementing Partner'), (b'WEB', b'Web')]),
        ),
    ]
