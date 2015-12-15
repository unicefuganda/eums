from eums.models import MultipleChoiceQuestion, Option, NumericQuestion, TextQuestion, Flow, Runnable

web_flow, _ = Flow.objects.get_or_create(label=Flow.Label.WEB)

web_question_1, _ = MultipleChoiceQuestion.objects.get_or_create(
     text='Was the item received?', label='itemReceived', flow=web_flow,
    when_answered='update_consignee_inventory', position=1)
yes_1, _ = Option.objects.get_or_create(text='Yes', question=web_question_1)
Option.objects.get_or_create(text='No', question=web_question_1)

web_question_2, _ = NumericQuestion.objects.get_or_create(
     text='How much was received?', label='amountReceived', flow=web_flow,
    when_answered='update_consignee_stock_level', position=2)

web_question_3, _ = MultipleChoiceQuestion.objects.get_or_create(

    text='What is the quality of the product?', label='qualityOfProduct', flow=web_flow, position=3)
good, _ = Option.objects.get_or_create(text='Good', question=web_question_3)
damaged, _ = Option.objects.get_or_create(text='Damaged', question=web_question_3)
substandard, _ = Option.objects.get_or_create(text='Substandard', question=web_question_3)
expired, _ = Option.objects.get_or_create(text='Expired', question=web_question_3)
incomplete, _ = Option.objects.get_or_create(text='Incomplete', question=web_question_3)
web_flow.end_nodes = [
    [web_question_3.id, damaged.id],
    [web_question_3.id, substandard.id],
    [web_question_3.id, expired.id],
    [web_question_3.id, incomplete.id]
]
web_flow.save()

web_question_4, _ = MultipleChoiceQuestion.objects.get_or_create(

    text='Are you satisfied with the product?', label='satisfiedWithProduct', flow=web_flow, position=4)
yes_2, _ = Option.objects.get_or_create(text='Yes', question=web_question_4)
no_2, _ = Option.objects.get_or_create(text='No', question=web_question_4)
web_flow.end_nodes.append([web_question_4.id, yes_2.id])
web_flow.save()

web_question_5, _ = TextQuestion.objects.get_or_create(

    text='Remarks', label='additionalDeliveryComments',
    flow=web_flow, position=5)
web_flow.end_nodes.append([web_question_5.id, Flow.NO_OPTION])
web_flow.save()
