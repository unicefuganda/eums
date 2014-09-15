# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('eums', '0002_distributionplan'),
    ]

    operations = [
        migrations.CreateModel(
            name='Consignee',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('contact_person_id', models.CharField(max_length=255)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DistributionPlanItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.IntegerField()),
                ('under_current_supply_plan', models.BooleanField(default=True)),
                ('planned_distribution_date', models.DateField()),
                ('destination_location', models.CharField(max_length=255)),
                ('remark', models.TextField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('description', models.CharField(max_length=255)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ItemUnit',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Programme',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('focal_person', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='item',
            name='unit',
            field=models.ForeignKey(to='eums.ItemUnit'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplanitem',
            name='item',
            field=models.ForeignKey(to='eums.Item'),
            preserve_default=True,
        ),
        migrations.RemoveField(
            model_name='distributionplan',
            name='programme_name',
        ),
        migrations.AddField(
            model_name='distributionplan',
            name='items',
            field=models.ManyToManyField(to='eums.DistributionPlanItem'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplan',
            name='programme',
            field=models.ForeignKey(default=1, to='eums.Programme'),
            preserve_default=False,
        ),
    ]
