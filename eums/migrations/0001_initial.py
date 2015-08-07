# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import djorm_pgarray.fields
import django.utils.timezone
from django.conf import settings
import model_utils.fields
import django_extensions.db.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Arc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Consignee',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('customer_id', models.CharField(max_length=255, null=True, blank=True)),
                ('location', models.CharField(max_length=255, null=True, blank=True)),
                ('type', model_utils.fields.StatusField(default=b'implementing_partner', max_length=100, no_check_for_status=True, choices=[(b'implementing_partner', b'implementing_partner'), (b'middle_man', b'middle_man'), (b'end_user', b'end_user')])),
                ('imported_from_vision', models.BooleanField(default=False)),
                ('remarks', models.TextField(null=True, blank=True)),
                ('created_by_user', models.ForeignKey(editable=False, to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DistributionReport',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('total_received', models.IntegerField()),
                ('total_distributed', models.IntegerField()),
                ('total_not_received', models.IntegerField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
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
                ('end_nodes', djorm_pgarray.fields.IntegerArrayField(dimension=2)),
                ('for_runnable_type', models.CharField(unique=True, max_length=255, choices=[(b'END_USER', b'End User'), (b'MIDDLE_MAN', b'Middleman'), (b'IMPLEMENTING_PARTNER', b'Implementing Partner')])),
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
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='NumericAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.BigIntegerField()),
            ],
            options={
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
            name='OrderItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('item_number', models.IntegerField(default=0, null=True)),
                ('quantity', models.DecimalField(null=True, max_digits=12, decimal_places=2)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Programme',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('wbs_element_ex', models.CharField(unique=True, max_length=255)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PurchaseOrder',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_number', models.IntegerField(unique=True)),
                ('date', models.DateField(null=True)),
                ('is_single_ip', models.NullBooleanField()),
                ('po_type', models.CharField(max_length=255, null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PurchaseOrderItem',
            fields=[
                ('orderitem_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.OrderItem')),
                ('value', models.DecimalField(null=True, max_digits=12, decimal_places=2)),
                ('purchase_order', models.ForeignKey(to='eums.PurchaseOrder')),
            ],
            options={
                'abstract': False,
            },
            bases=('eums.orderitem',),
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('label', models.CharField(unique=True, max_length=255)),
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
            name='ReleaseOrder',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_number', models.IntegerField(unique=True)),
                ('waybill', models.IntegerField()),
                ('delivery_date', models.DateField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('purchase_order', models.ForeignKey(related_name=b'release_orders', to='eums.PurchaseOrder', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ReleaseOrderItem',
            fields=[
                ('orderitem_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.OrderItem')),
                ('value', models.DecimalField(max_digits=12, decimal_places=2)),
                ('purchase_order_item', models.ForeignKey(to='eums.PurchaseOrderItem')),
                ('release_order', models.ForeignKey(related_name=b'items', to='eums.ReleaseOrder')),
            ],
            options={
            },
            bases=('eums.orderitem',),
        ),
        migrations.CreateModel(
            name='Run',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('scheduled_message_task_id', models.CharField(max_length=255)),
                ('status', model_utils.fields.StatusField(default=b'scheduled', max_length=100, no_check_for_status=True, choices=[(b'scheduled', b'scheduled'), (b'completed', b'completed'), (b'expired', b'expired'), (b'cancelled', b'cancelled')])),
                ('phone', models.CharField(max_length=255)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Runnable',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('location', models.CharField(max_length=255)),
                ('contact_person_id', models.CharField(max_length=255)),
                ('track', models.BooleanField(default=False)),
                ('delivery_date', models.DateField()),
                ('remark', models.TextField(null=True, blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DistributionPlanNode',
            fields=[
                ('runnable_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.Runnable')),
                ('tree_position', models.CharField(max_length=255, choices=[(b'MIDDLE_MAN', b'Middleman'), (b'END_USER', b'End User'), (b'IMPLEMENTING_PARTNER', b'Implementing Partner')])),
            ],
            options={
                'abstract': False,
            },
            bases=('eums.runnable',),
        ),
        migrations.CreateModel(
            name='DistributionPlan',
            fields=[
                ('runnable_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.Runnable')),
                ('date', models.DateField(auto_now=True)),
                ('programme', models.ForeignKey(to='eums.Programme')),
            ],
            options={
            },
            bases=('eums.runnable',),
        ),
        migrations.CreateModel(
            name='RunQueue',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('contact_person_id', models.CharField(max_length=255)),
                ('status', model_utils.fields.StatusField(default=b'not_started', max_length=100, no_check_for_status=True, choices=[(b'not_started', b'not_started'), (b'started', b'started')])),
                ('run_delay', models.DecimalField(max_digits=12, decimal_places=1)),
                ('runnable', models.ForeignKey(to='eums.Runnable')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SalesOrder',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_number', models.IntegerField(unique=True)),
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
                ('orderitem_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='eums.OrderItem')),
                ('net_price', models.DecimalField(max_digits=20, decimal_places=4)),
                ('net_value', models.DecimalField(max_digits=20, decimal_places=4)),
                ('issue_date', models.DateField()),
                ('delivery_date', models.DateField(null=True)),
                ('description', models.CharField(max_length=255)),
                ('sales_order', models.ForeignKey(to='eums.SalesOrder')),
            ],
            options={
                'abstract': False,
            },
            bases=('eums.orderitem',),
        ),
        migrations.CreateModel(
            name='TextAnswer',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.CharField(max_length=255)),
            ],
            options={
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
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', django_extensions.db.fields.CreationDateTimeField(default=django.utils.timezone.now, verbose_name='created', editable=False, blank=True)),
                ('modified', django_extensions.db.fields.ModificationDateTimeField(default=django.utils.timezone.now, verbose_name='modified', editable=False, blank=True)),
                ('consignee', models.ForeignKey(blank=True, to='eums.Consignee', null=True)),
                ('user', models.OneToOneField(related_name=b'user_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-modified', '-created'),
                'abstract': False,
                'get_latest_by': 'modified',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='textanswer',
            name='question',
            field=models.ForeignKey(to='eums.TextQuestion'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='textanswer',
            name='run',
            field=models.ForeignKey(to='eums.Run'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='runnable',
            name='consignee',
            field=models.ForeignKey(to='eums.Consignee'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='runnable',
            name='polymorphic_ctype',
            field=models.ForeignKey(related_name=b'polymorphic_eums.runnable_set+', editable=False, to='contenttypes.ContentType', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='run',
            name='runnable',
            field=models.ForeignKey(to='eums.Runnable'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='releaseorder',
            name='sales_order',
            field=models.ForeignKey(related_name=b'release_orders', to='eums.SalesOrder'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='question',
            name='flow',
            field=models.ForeignKey(related_name=b'questions', to='eums.Flow'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='question',
            unique_together=set([('flow', 'label')]),
        ),
        migrations.AddField(
            model_name='purchaseorderitem',
            name='sales_order_item',
            field=models.ForeignKey(to='eums.SalesOrderItem'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='purchaseorder',
            name='sales_order',
            field=models.ForeignKey(to='eums.SalesOrder'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='orderitem',
            name='item',
            field=models.ForeignKey(to='eums.Item'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='orderitem',
            name='polymorphic_ctype',
            field=models.ForeignKey(related_name=b'polymorphic_eums.orderitem_set+', editable=False, to='contenttypes.ContentType', null=True),
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
            model_name='numericanswer',
            name='run',
            field=models.ForeignKey(to='eums.Run'),
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
            name='run',
            field=models.ForeignKey(to='eums.Run'),
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
            field=models.ForeignKey(to='eums.ItemUnit', null=True),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='item',
            unique_together=set([('description', 'material_code')]),
        ),
        migrations.AddField(
            model_name='distributionreport',
            name='programme',
            field=models.ForeignKey(to='eums.Programme'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='distributionreport',
            unique_together=set([('consignee', 'programme')]),
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='distribution_plan',
            field=models.ForeignKey(to='eums.DistributionPlan'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='item',
            field=models.ForeignKey(to='eums.OrderItem'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='arc',
            name='source',
            field=models.ForeignKey(related_name=b'arcs_out', blank=True, to='eums.DistributionPlanNode', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='arc',
            name='target',
            field=models.ForeignKey(related_name=b'arcs_in', to='eums.DistributionPlanNode'),
            preserve_default=True,
        ),
    ]
