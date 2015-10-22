# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0029_auto_20151021_1128'),
    ]

    operations = [
        migrations.AddField(
            model_name='consignee',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='consignee',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='item',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='item',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='itemunit',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='itemunit',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='multiplechoiceanswer',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='multiplechoiceanswer',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='numericanswer',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='numericanswer',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='orderitem',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='orderitem',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='programme',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='programme',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='question',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='question',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='releaseorder',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='releaseorder',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='run',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='run',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='salesorder',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='salesorder',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='textanswer',
            name='created',
            field=models.DateTimeField(default=timezone.now, auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='textanswer',
            name='modified',
            field=models.DateTimeField(default=timezone.now, auto_now=True),
            preserve_default=False,
        ),
    ]
