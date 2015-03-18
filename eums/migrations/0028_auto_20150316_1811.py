# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from eums.models import NodeLineItemRun, MultipleChoiceQuestion

def create_received_no_answers(apps, schema_editor):
    """Forward data migration that creates no answers for completed runs where no was not saved
    """
    product_received_question_filter = MultipleChoiceQuestion.objects.filter(label='productReceived')
    if product_received_question_filter:
        product_received_question = product_received_question_filter[0]
        product_not_received_answer_option_filter = product_received_question.option_set.filter(text='No')
        if product_not_received_answer_option_filter:
            completed_runs = NodeLineItemRun.objects.filter(status='completed')
            for run in completed_runs:
                product_received_answer = run.multiplechoiceanswer_set.filter(question=product_received_question)
                if product_received_answer:
                    continue

                # Create no answer for run
                run.multiplechoiceanswer_set.create(question=product_received_question,
                                                    value=product_not_received_answer_option_filter[0],
                                                    line_item_run=run)


def remove_received_no_answers(apps, schema_editor):
    """Backward data migration that removes no answers for completed runs where no was not saved

    """
    product_received_question_filter = MultipleChoiceQuestion.objects.filter(label='productReceived')
    if product_received_question_filter:
        product_received_question = product_received_question_filter[0]
        product_not_received_answer_option_filter = product_received_question.option_set.filter(text='No')
        if product_not_received_answer_option_filter:
            completed_runs = NodeLineItemRun.objects.filter(status='completed')
            for run in completed_runs:
                # Delete no answer for run
                run.multiplechoiceanswer_set.filter(question=product_received_question,
                                                    value=product_not_received_answer_option_filter[0]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0027_releaseorder_purchase_order'),
    ]

    operations = [
        migrations.RunPython(create_received_no_answers, remove_received_no_answers)
    ]
