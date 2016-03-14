from eums.models import MultipleChoiceQuestion, Option, NumericQuestion, TextQuestion, Flow, Question

web_flow, _ = Flow.objects.get_or_create(label=Flow.Label.WEB)

web_question_1 = Question.build_question(MultipleChoiceQuestion, text='Was the item received?', label='itemReceived',
                                         flow=web_flow, when_answered='update_consignee_inventory', position=1)
yes_1 = Option.build_option(text='Yes', question=web_question_1)
no_1 = Option.build_option(text='No', question=web_question_1)

web_question_2 = Question.build_question(NumericQuestion, text='How much was received?', label='amountReceived',
                                         flow=web_flow, when_answered='update_consignee_stock_level', position=2)

web_question_3 = Question.build_question(MultipleChoiceQuestion, text='What is the quality of the product?',
                                         label='qualityOfProduct', flow=web_flow, position=3)
good = Option.build_option(text='Good', question=web_question_3)
damaged = Option.build_option(text='Damaged', question=web_question_3)
substandard = Option.build_option(text='Substandard', question=web_question_3)
expired = Option.build_option(text='Expired', question=web_question_3)
incomplete = Option.build_option(text='Incomplete', question=web_question_3)

web_flow.final_end_nodes = [
    [web_question_3.id, damaged.id],
    [web_question_3.id, substandard.id],
    [web_question_3.id, expired.id],
    [web_question_3.id, incomplete.id]
]
web_flow.save()

web_question_4 = Question.build_question(MultipleChoiceQuestion, text='Are you satisfied with the product?',
                                         label='satisfiedWithProduct', flow=web_flow, position=4)
yes_2 = Option.build_option(text='Yes', question=web_question_4)
no_2 = Option.build_option(text='No', question=web_question_4)
web_flow.final_end_nodes.append([web_question_4.id, yes_2.id])
web_flow.save()

web_question_5 = Question.build_question(TextQuestion, text='Remarks', label='additionalDeliveryComments',
                                         flow=web_flow, position=5)
web_flow.final_end_nodes.append([web_question_5.id, Flow.NO_OPTION])
web_flow.save()
