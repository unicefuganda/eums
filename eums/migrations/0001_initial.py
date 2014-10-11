# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields
from django.conf import settings
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
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
            name='DistributionPlan',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date', models.DateField(auto_now=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DistributionPlanLineItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('targeted_quantity', models.IntegerField()),
                ('planned_distribution_date', models.DateField()),
                ('contact_person', models.CharField(max_length=255)),
                ('contact_phone_number', models.CharField(max_length=255)),
                ('destination_location', models.CharField(max_length=255)),
                ('mode_of_delivery', models.CharField(max_length=255)),
                ('tracked', models.BooleanField(default=False)),
                ('remark', models.TextField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DistributionPlanNode',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('tree_position', models.CharField(max_length=255, choices=[(b'MIDDLE_MAN', b'Middleman'), (b'END_USER', b'End User')])),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('distribution_plan', models.ForeignKey(to='eums.DistributionPlan')),
                ('parent', models.ForeignKey(related_name=b'children', blank=True, to='eums.DistributionPlanNode', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Flow',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('rapid_pro_id', models.IntegerField()),
                ('end_questions', djorm_pgarray.fields.IntegerArrayField()),
                ('for_node_type', models.CharField(unique=True, max_length=255, choices=[(b'END_USER', b'End user'), (b'MIDDLE_MAN', b'Middleman')])),
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
                ('material_code', models.CharField(max_length=255)),
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
            name='MultipleChoiceAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='NodeLineItemRun',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('scheduled_message_task_id', models.CharField(max_length=255)),
                ('status', model_utils.fields.StatusField(default=b'scheduled', max_length=100, no_check_for_status=True, choices=[(b'scheduled', b'scheduled'), (b'completed', b'completed'), (b'expired', b'expired'), (b'cancelled', b'cancelled')])),
                ('phone', models.CharField(max_length=255)),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('node_line_item', models.ForeignKey(to='eums.DistributionPlanLineItem')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='NumericAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.BigIntegerField()),
                ('line_item_run', models.ForeignKey(to='eums.NodeLineItemRun')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.CharField(max_length=255)),
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
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('label', models.CharField(unique=True, max_length=255)),
                ('final', models.BooleanField(default=False)),
                ('uuids', djorm_pgarray.fields.TextArrayField(dbtype=b'text')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='NumericQuestion',
            fields=[
                ('question_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.Question')),
            ],
            options={
            },
            bases=('eums.question',),
        ),
        migrations.CreateModel(
            name='MultipleChoiceQuestion',
            fields=[
                ('question_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.Question')),
            ],
            options={
            },
            bases=('eums.question',),
        ),
        migrations.CreateModel(
            name='RunQueue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('contact_person_id', models.CharField(max_length=255)),
                ('status', model_utils.fields.StatusField(default=b'not_started', max_length=100, no_check_for_status=True, choices=[(b'not_started', b'not_started'), (b'started', b'started')])),
                ('run_delay', models.DecimalField(max_digits=12, decimal_places=1)),
                ('node_line_item', models.ForeignKey(to='eums.DistributionPlanLineItem')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SalesOrder',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_number', models.CharField(max_length=255)),
                ('date', models.DateField()),
                ('description', models.CharField(max_length=255, null=True)),
                ('programme', models.ForeignKey(to='eums.Programme')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SalesOrderItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.IntegerField()),
                ('net_price', models.DecimalField(max_digits=20, decimal_places=4)),
                ('net_value', models.DecimalField(max_digits=20, decimal_places=4)),
                ('issue_date', models.DateField()),
                ('delivery_date', models.DateField(null=True)),
                ('description', models.CharField(max_length=255)),
                ('item', models.ForeignKey(to='eums.Item')),
                ('sales_order', models.ForeignKey(to='eums.SalesOrder')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TextAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.CharField(max_length=255)),
                ('line_item_run', models.ForeignKey(to='eums.NodeLineItemRun')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TextQuestion',
            fields=[
                ('question_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.Question')),
            ],
            options={
            },
            bases=('eums.question',),
        ),
        migrations.AddField(
            model_name='textanswer',
            name='question',
            field=models.ForeignKey(to='eums.TextQuestion'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='option',
            name='question',
            field=models.ForeignKey(to='eums.MultipleChoiceQuestion'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='option',
            unique_together=set([('text', 'question')]),
        ),
        migrations.AddField(
            model_name='numericanswer',
            name='question',
            field=models.ForeignKey(to='eums.NumericQuestion'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='multiplechoiceanswer',
            name='line_item_run',
            field=models.ForeignKey(to='eums.NodeLineItemRun'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='multiplechoiceanswer',
            name='question',
            field=models.ForeignKey(to='eums.MultipleChoiceQuestion'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='multiplechoiceanswer',
            name='value',
            field=models.ForeignKey(to='eums.Option'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='item',
            name='unit',
            field=models.ForeignKey(to='eums.ItemUnit'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='flow',
            name='questions',
            field=models.ManyToManyField(to='eums.Question'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='distributionplannode',
            unique_together=set([('distribution_plan', 'consignee')]),
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='distribution_plan_node',
            field=models.ForeignKey(to='eums.DistributionPlanNode'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='item',
            field=models.ForeignKey(to='eums.SalesOrderItem'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplanlineitem',
            name='programme_focal',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplan',
            name='programme',
            field=models.ForeignKey(to='eums.Programme'),
            preserve_default=True,
        ),
    ]
