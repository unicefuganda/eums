from eums.models import MultipleChoiceQuestion, Option, NumericQuestion, TextQuestion, Flow

web_flow, _ = Flow.objects.get_or_create(label=Flow.Label.WEB)

web_question_1 = MultipleChoiceQuestion.objects.filter(label='itemReceived', flow=web_flow)
if web_question_1.exists():
    web_question_1.update(text='Was the item received?', when_answered='update_consignee_inventory', position=1)
else:
    web_question_1 = MultipleChoiceQuestion.objects.create(
            text='Was the item received?', label='itemReceived', flow=web_flow,
            when_answered='update_consignee_inventory', position=1)
yes_1 = Option.objects.filter(text='Yes', question=web_question_1)
if yes_1.count() < 1:
    yes_1 = Option.objects.create(text='Yes', question=web_question_1)
yes_2 = Option.objects.filter(text='No', question=web_question_1)
if yes_2.count() < 1:
    yes_2 = Option.objects.create(text='No', question=web_question_1)

web_question_2 = NumericQuestion.objects.filter(label='amountReceived', flow=web_flow)
if web_question_2.exists():
    web_question_2.update(text='How much was received?', when_answered='update_consignee_stock_level', position=2)
else:
    web_question_2 = NumericQuestion.objects.create(
            text='How much was received?', label='amountReceived', flow=web_flow,
            when_answered='update_consignee_stock_level', position=2)

web_question_3 = MultipleChoiceQuestion.objects.filter(label='qualityOfProduct', flow=web_flow)
if web_question_3.exists():
    web_question_3.update(text='What is the quality of the product?', position=3)
else:
    web_question_3 = MultipleChoiceQuestion.objects.create(
            text='What is the quality of the product?', label='qualityOfProduct', flow=web_flow, position=3)
good = Option.objects.filter(text='Good', question=web_question_3)
if good.count() < 1:
    good = Option.objects.create(text='Good', question=web_question_3)
damaged = Option.objects.filter(text='Damaged', question=web_question_3)
if damaged.count() < 1:
    damaged = Option.objects.create(text='Damaged', question=web_question_3)
substandard = Option.objects.filter(text='Substandard', question=web_question_3)
if substandard.count() < 1:
    substandard = Option.objects.create(text='Substandard', question=web_question_3)
expired = Option.objects.filter(text='Expired', question=web_question_3)
if expired.count() < 1:
    expired = Option.objects.create(text='Expired', question=web_question_3)
incomplete = Option.objects.filter(text='Incomplete', question=web_question_3)
if incomplete.count() < 1:
    incomplete = Option.objects.create(text='Incomplete', question=web_question_3)
web_flow.end_nodes = [
    [web_question_3.id, damaged.id],
    [web_question_3.id, substandard.id],
    [web_question_3.id, expired.id],
    [web_question_3.id, incomplete.id]
]
web_flow.save()

web_question_4 = MultipleChoiceQuestion.objects.filter(label='satisfiedWithProduct', flow=web_flow)
if web_question_4.exists():
    web_question_4.update(text='Are you satisfied with the product?', position=4)
else:
    web_question_4 = MultipleChoiceQuestion.objects.create(
            text='Are you satisfied with the product?', label='satisfiedWithProduct', flow=web_flow, position=4)
yes_2 = Option.objects.filter(text='Yes', question=web_question_4)
if yes_2.count() < 1:
    yes_2 = Option.objects.create(text='Yes', question=web_question_4)
no_2 = Option.objects.filter(text='No', question=web_question_4)
if no_2.count() < 1:
    no_2 = Option.objects.create(text='No', question=web_question_4)
web_flow.end_nodes.append([web_question_4.id, yes_2.id])
web_flow.save()

web_question_5 = TextQuestion.objects.filter(label='additionalDeliveryComments', flow=web_flow)
if web_question_5.exists():
    web_question_5.update(text='Remarks', position=5)
else:
    web_question_5 = TextQuestion.objects.create(
            text='Remarks', label='additionalDeliveryComments', flow=web_flow, position=5)
web_flow.end_nodes.append([web_question_5.id, Flow.NO_OPTION])
web_flow.save()
