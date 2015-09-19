# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0022_distributionplannode_acknowledged'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='alert',
            options={'ordering': ['is_resolved']},
        ),
        migrations.AddField(
            model_name='distributionplannode',
            name='total_value',
            field=models.DecimalField(null=True, max_digits=12, decimal_places=2),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='multiplechoiceanswer',
            name='run',
            field=models.ForeignKey(related_name=b'multi_choice_answers', to='eums.Run'),
        ),
        migrations.AlterField(
            model_name='run',
            name='runnable',
            field=models.ForeignKey(related_name=b'runs', to='eums.Runnable'),
        ),
    ]
