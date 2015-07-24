# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0001_initial'),
        ('eums', '0041_auto_20150724_1936'),
    ]

    operations = [
        migrations.CreateModel(
            name='Runnable',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('location', models.CharField(max_length=255)),
                ('contact_person_id', models.CharField(max_length=255)),
                ('track', models.BooleanField(default=False)),
                ('delivery_date', models.DateField()),
                ('remark', models.TextField(null=True, blank=True)),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('polymorphic_ctype', models.ForeignKey(related_name=b'polymorphic_eums.runnable_set+', editable=False, to='contenttypes.ContentType', null=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='consignee',
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='contact_person_id',
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='delivery_date',
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='id',
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='location',
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='remark',
        ),
        migrations.RemoveField(
            model_name='distributionplannode',
            name='track',
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='runnable_ptr',
            field=models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.Runnable'),
            preserve_default=False,
        ),
    ]
